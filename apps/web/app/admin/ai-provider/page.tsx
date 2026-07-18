'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Eye, EyeOff, Loader2, RefreshCw, Trash2, AlertCircle } from 'lucide-react'
import {
  useGetAIProvidersQuery,
  useCreateAIProviderMutation,
  useUpdateAIProviderMutation,
  useDeleteAIProviderMutation,
  useTestConnectionMutation,
  useUpdateModelsMutation,
  type ProviderModel,
} from '@/lib/features/ai-providers-api-slice'

export default function AdminAIProviderPage() {
  const { data: providers, isLoading, error: queryError, refetch } = useGetAIProvidersQuery()
  const [createProvider, { isLoading: isCreating }] = useCreateAIProviderMutation()
  const [updateProvider, { isLoading: isUpdating }] = useUpdateAIProviderMutation()
  const [deleteProvider, { isLoading: isDeleting }] = useDeleteAIProviderMutation()
  const [testConnection, { isLoading: testing }] = useTestConnectionMutation()
  const [updateModels] = useUpdateModelsMutation()

  const provider = providers?.[0] ?? null

  const [apiKey, setApiKey] = useState('')
  const [defaultModel, setDefaultModel] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [connectionResult, setConnectionResult] = useState<'idle' | 'success' | 'fail' | 'testing'>('idle')
  const [models, setModels] = useState<ProviderModel[]>([])
  const [dirty, setDirty] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (provider) {
      setApiKey(provider.apiKey || '')
      setDefaultModel(provider.defaultModel || '')
      setBaseUrl(provider.baseUrl || '')
      setModels(provider.models || [])
      setDirty(false)
      setConnectionResult('idle')
    }
  }, [provider])

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  const handleTestConnection = async () => {
    if (!provider) return
    setPageError(null)
    setConnectionResult('testing')
    try {
      const result = await testConnection(provider.id).unwrap()
      setConnectionResult(result ? 'success' : 'fail')
    } catch (err) {
      setConnectionResult('fail')
      setPageError(err instanceof Error ? err.message : 'Connection test failed')
    }
  }

  const handleFetchModels = async () => {
    if (!provider) return
    setPageError(null)
    try {
      const res = await fetch(`/api/ai-providers/${provider.id}/models`, {
        credentials: 'include',
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err?.error?.message || 'Failed to fetch models')
      }
      const json = await res.json()
      setModels(json.data || [])
      showSuccess('Models fetched successfully')
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to fetch models')
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
              <Label htmlFor="create-base-url">Base URL (optional)</Label>
              <Input
                id="create-base-url"
                placeholder="https://openrouter.ai/api/v1"
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
            <Label htmlFor="base-url">Base URL (optional)</Label>
            <Input
              id="base-url"
              value={baseUrl}
              onChange={(e) => {
                setBaseUrl(e.target.value)
                setDirty(true)
              }}
              placeholder="https://openrouter.ai/api/v1"
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Models</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchModels}
                disabled={!apiKey}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Fetch Models
              </Button>
            </div>

            {models.length > 0 ? (
              <div className="space-y-1 max-h-64 overflow-y-auto border rounded-md p-1">
                {models.map((model) => (
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
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No models loaded. Click &quot;Fetch Models&quot; to load available models from the provider.
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
