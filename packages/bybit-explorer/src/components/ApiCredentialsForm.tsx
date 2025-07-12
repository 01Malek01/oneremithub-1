import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Key, Info } from "lucide-react";
import { BybitCredentials } from "@/lib/bybit-api";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiCredentialsFormProps {
  onCredentialsSubmit: (credentials: BybitCredentials) => void;
  isLoading: boolean;
}

const ApiCredentialsForm = ({ onCredentialsSubmit, isLoading }: ApiCredentialsFormProps) => {
  const [apiKey, setApiKey] = useState<string>("");
  const [apiSecret, setApiSecret] = useState<string>("");
  const [showSecret, setShowSecret] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim() === "" || apiSecret.trim() === "") {
      return;
    }
    onCredentialsSubmit({ apiKey, apiSecret });
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Bybit P2P API Credentials</CardTitle>
        <CardDescription>
          Enter your Bybit API key and secret to fetch your P2P trade data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your API key must have <strong>Read-only</strong> permissions for P2P trading. 
            Create a key with <strong>spot and P2P</strong> permissions in your Bybit account settings.
          </AlertDescription>
        </Alert>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium">
              API Key
            </label>
            <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
              <span className="pl-3 text-muted-foreground">
                <Key size={18} />
              </span>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Enter your Bybit API key"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="apiSecret" className="text-sm font-medium">
              API Secret
            </label>
            <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
              <span className="pl-3 text-muted-foreground">
                <Key size={18} />
              </span>
              <Input
                id="apiSecret"
                type={showSecret ? "text" : "password"}
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Enter your Bybit API secret"
                required
              />
              <Button
                type="button"
                variant="ghost"
                className="h-8 w-8 p-0 mr-1"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Fetching Data..." : "Fetch P2P Trades"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ApiCredentialsForm;
