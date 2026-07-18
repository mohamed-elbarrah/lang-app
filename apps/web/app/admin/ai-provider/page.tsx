import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function AdminAIProviderPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Provider Settings</h1>
        <p className="text-muted-foreground mt-1">Configure the AI engine for the platform.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Provider</CardTitle>
              <CardDescription>Select and configure the primary AI provider.</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Connected</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select defaultValue="openrouter">
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input id="api-key" type="password" defaultValue="sk-or-v1-xxxxxxxxxxxxxxxxxxxx" />
            <p className="text-xs text-muted-foreground">Keep this key secret. It's used for all API requests.</p>
          </div>

          <div className="space-y-2">
            <Label>Default Model</Label>
            <Select defaultValue="gpt-4o-mini">
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast, Cheap)</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o (High Quality)</SelectItem>
                <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                <SelectItem value="llama-3-8b">Llama 3 8B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Test Connection</Button>
          <Button>Save Configuration</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
