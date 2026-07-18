'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Eye, EyeOff, Loader2, RefreshCw, Trash2, AlertCircle, Search, CheckSquare, Square } from 'lucide-react'
import {
  useGetAIProvidersQuery,
  useCreateAIProviderMutation,
  useUpdateAIProviderMutation,
  useDeleteAIProviderMutation,
  useTestConnectionMutation,
  useUpdateModelsMutation,
  type ProviderModel,
} from '@/lib/features/ai-providers-api-slice'

const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1'

export default function AdminAIProviderPage() {
  const { data: rawProviders, isLoading, error: queryError, refetch } = useGetAIProvidersQuery()
  const providers = rawProviders && typeof rawProviders === 'object' && 'data' in rawProviders
    ? (rawProviders as any).data
    : rawProviders
  const [createProvider, { isLoading: isCreating }] = useCreateAIProviderMutation()
  const [updateProvider, { isLoading: isUpdating }] = useUpdateAIProviderMutation()
  const [deleteProvider, { isLoading: isDeleting }] = useDeleteAIProviderMutation()
  const [testConnection, { isLoading: testing }] = useTestConnectionMutation()
  const [updateModels] = useUpdateModelsMutation()

  const provider = providers?.[0] ?? null

  const [apiKey, setApiKey] = useState('')
  const [defaultModel, setDefaultModel] = useState('')
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL)
  const [showKey, setShowKey] = useState(false)
  const [connectionResult, setConnectionResult] = useState<'idle' | 'success' | 'fail' | 'testing'>('idle')
  const [models, setModels] = useState<ProviderModel[]>([])
  const [dirty, setDirty] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [modelSearch, setModelSearch] = useState('')
  const [autoFetching, setAutoFetching] = useState(false)
  const autoFetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoFetchedForKey = useRef('')

  useEffect(() => {
    if (provider) {
      setApiKey(provider.apiKey || '')
      setDefaultModel(provider.defaultModel || '')
      setBaseUrl(provider.baseUrl || DEFAULT_BASE_URL)
      setModels(provider.models || [])
      setDirty(false)
      setConnectionResult('idle')
    }
  }, [provider])

  useEffect(() => {
    if (autoFetchTimer.current) clearTimeout(autoFetchTimer.current)
    if (!provider || !apiKey || autoFetchedForKey.current === apiKey) return
    autoFetchedForKey.current = apiKey
    autoFetchTimer.current = setTimeout(async () => {
      setAutoFetching(true)
      try {
        const res = await fetch(`/api/ai-providers/${provider!.id}/models`, {
          credentials: 'include',
        })
        if (res.ok) {
          const body = await safeParseJson(res)
          setModels(body.data || [])
        }
      } catch {
        /* silent — models will just not load */
      } finally {
        setAutoFetching(false)
      }
    }, 1200)
    return () => {
      if (autoFetchTimer.current) clearTimeout(autoFetchTimer.current)
    }
  }, [apiKey, provider])

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  const handleTestConnection = async () => {
    if (!provider) return
    setPageError(null)
    setConnectionResult('testing')
    try {
      const raw: any = await testConnection(provider.id).unwrap()
      const connected = raw?.data != null ? raw.data : raw
      setConnectionResult(connected ? 'success' : 'fail')
    } catch (err) {
      setConnectionResult('fail')
      setPageError(err instanceof Error ? err.message : 'Connection test failed')
    }
  }

  const safeParseJson = async (res: Response): Promise<any> => {
    const text = await res.text()
    try {
      return JSON.parse(text)
    } catch {
      throw new Error(`Server returned non-JSON response (${res.status})`)
    }
  }

  const handleFetchModels = async (isAuto = false) => {
    if (!provider) return
    setPageError(null)
    if (isAuto) setAutoFetching(true)
    try {
      const res = await fetch(`/api/ai-providers/${provider.id}/models`, {
        credentials: 'include',
      })
      const body = await safeParseJson(res)
      if (!res.ok) {
        throw new Error(body?.error?.message || `Request failed (${res.status})`)
      }
      setModels(body.data || [])
      if (!isAuto) showSuccess('Models fetched successfully')
    } catch (err) {
      if (!isAuto) setPageError(err instanceof Error ? err.message : 'Failed to fetch models')
    } finally {
      setAutoFetching(false)
    }
  }

  const handleToggleModel = async (modelId: string, isEnabled: boolean) => {
    if (!provider) return
    setPageError(null)
    const updated = models.map((m) =>
      m.id === modelId ? { ...m, isEnabled } : m,
    )
    setModels(updated)
    try {
      await updateModels({
        id: provider.id,
        models: updated.map((m) => ({ id: m.id, isEnabled: m.isEnabled })),
      }).unwrap()
    } catch (err) {
      setModels(models)
      setPageError(err instanceof Error ? err.message : 'Failed to update model')
    }
  }

  const handleToggleAll = async (enabled: boolean) => {
    if (!provider) return
    setPageError(null)
    const updated = models.map((m) => ({ ...m, isEnabled: enabled }))
    setModels(updated)
    try {
      await updateModels({
        id: provider.id,
        models: updated.map((m) => ({ id: m.id, isEnabled: m.isEnabled })),
      }).unwrap()
    } catch (err) {
      setModels(models)
      setPageError(err instanceof Error ? err.message : 'Failed to update models')
    }
  }

  const handleSave = async () => {
    if (!provider) return
    setPageError(null)
    setSuccessMsg(null)
    try {
      await updateProvider({
        id: provider.id,
        data: {
          apiKey: apiKey || undefined,
          defaultModel: defaultModel || undefined,
          baseUrl: baseUrl || undefined,
          isActive: true,
        },
      }).unwrap()
      setDirty(false)
      showSuccess('Configuration saved')
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to save configuration')
    }
  }

  const handleCreate = async () => {
    setPageError(null)
    setSuccessMsg(null)
    try {
      await createProvider({
        name: 'OpenRouter',
        providerType: 'openrouter',
        apiKey,
        defaultModel: defaultModel || undefined,
        baseUrl: baseUrl || undefined,
        isActive: true,
      }).unwrap()
      showSuccess('Provider created successfully')
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to create provider')
    }
  }

  const handleDelete = async () => {
    if (!provider) return
    setPageError(null)
    try {
      await deleteProvider(provider.id).unwrap()
      showSuccess('Provider deleted')
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to delete provider')
    }
  }

  const filteredModels = useMemo(
    () =>
      modelSearch
        ? models.filter(
            (m) =>
              m.modelName.toLowerCase().includes(modelSearch.toLowerCase()) ||
              m.modelId.toLowerCase().includes(modelSearch.toLowerCase()),
          )
        : models,
    [models, modelSearch],
  )

  const allEnabled = models.length > 0 && models.every((m) => m.isEnabled)
  const allDisabled = models.length > 0 && models.every((m) => !m.isEnabled)

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (queryError) {
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">AI Provider Settings</h1>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Failed to load AI provider configuration.
          </CardContent>
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={refetch}>Retry</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Provider Settings</h1>
          <p className="text-muted-foreground mt-1">Configure the AI engine for the platform.</p>
        </div>

        {pageError && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-md">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {pageError}
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-md">
            {successMsg}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>No Provider Configured</CardTitle>
            <CardDescription>Create your first AI provider to get started.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-api-key">API Key *</Label>
              <Input
                id="create-api-key"
                type="password"
                placeholder="sk-or-v1-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-base-url">Base URL</Label>
              <Input
                id="create-base-url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-model">Default Model</Label>
              <Input
                id="create-model"
                placeholder="openai/gpt-4o-mini"
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreate} disabled={!apiKey || isCreating}>
              {isCreating ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Creating...</>
              ) : (
                'Create Provider'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Provider Settings</h1>
        <p className="text-muted-foreground mt-1">Configure the AI engine for the platform.</p>
      </div>

      {pageError && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {pageError}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-md">
          {successMsg}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{provider.name}</CardTitle>
              <CardDescription>
                {provider.providerType} &mdash; {provider.isActive ? 'Active' : 'Inactive'}
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className={
                connectionResult === 'testing'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : connectionResult === 'success'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : connectionResult === 'fail'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : provider.isActive
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-50 text-gray-500 border-gray-200'
              }
            >
              {connectionResult === 'testing'
                ? 'Testing...'
                : connectionResult === 'success'
                  ? 'Connected'
                  : connectionResult === 'fail'
                    ? 'Failed'
                    : provider.isActive
                      ? 'Active'
                      : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Provider Type</Label>
            <Select value={provider.providerType} disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  setDirty(true)
                }}
                placeholder="Enter your API key"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="base-url">Base URL</Label>
            <Input
              id="base-url"
              value={baseUrl}
              onChange={(e) => {
                setBaseUrl(e.target.value)
                setDirty(true)
              }}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Models</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFetchModels(false)}
                disabled={!apiKey || autoFetching}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${autoFetching ? 'animate-spin' : ''}`} />
                {autoFetching ? 'Fetching...' : 'Fetch Models'}
              </Button>
            </div>

            {autoFetching && models.length === 0 && (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Fetching models...
              </div>
            )}

            {models.length > 0 && (
              <>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search models..."
                    className="pl-8"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleAll(true)}
                    disabled={allEnabled}
                    className="text-xs h-7"
                  >
                    <CheckSquare className="h-3.5 w-3.5 mr-1" />
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleAll(false)}
                    disabled={allDisabled}
                    className="text-xs h-7"
                  >
                    <Square className="h-3.5 w-3.5 mr-1" />
                    Deselect All
                  </Button>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {models.filter((m) => m.isEnabled).length} / {models.length} enabled
                  </span>
                </div>

                <div className="space-y-1 max-h-64 overflow-y-auto border rounded-md p-1">
                  {filteredModels.length > 0 ? (
                    filteredModels.map((model) => (
                      <div
                        key={model.id}
                        className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted/50 text-sm"
                      >
                        <span className="font-medium truncate">{model.modelName}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground">{model.modelId}</span>
                          <Switch
                            checked={model.isEnabled}
                            onCheckedChange={(checked: boolean) =>
                              handleToggleModel(model.id, checked)
                            }
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No models match &quot;{modelSearch}&quot;
                    </p>
                  )}
                </div>
              </>
            )}

            {models.length === 0 && !autoFetching && (
              <p className="text-sm text-muted-foreground">
                No models loaded. Click &quot;Fetch Models&quot; or enter an API key to load available models.
              </p>
            )}
          </div>

          {models.filter((m) => m.isEnabled).length > 0 && (
            <div className="space-y-2">
              <Label>Default Model</Label>
              <Select value={defaultModel} onValueChange={(v) => { setDefaultModel(v ?? ''); setDirty(true) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select default model" />
                </SelectTrigger>
                <SelectContent>
                  {models
                    .filter((m) => m.isEnabled)
                    .map((model) => (
                      <SelectItem key={model.id} value={model.modelId}>
                        {model.modelName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing || !apiKey}
            >
              {testing ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Testing...</>
              ) : (
                'Test Connection'
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
              title="Delete provider"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleSave} disabled={isUpdating || !dirty}>
            {isUpdating ? (
              <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...</>
            ) : (
              'Save Configuration'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
