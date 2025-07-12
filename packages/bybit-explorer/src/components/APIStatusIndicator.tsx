
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { WifiHigh, WifiOff, Settings } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import ApiCredentialsForm from "./ApiCredentialsForm";
import { BybitCredentials } from "@/lib/bybit-api";

interface APIStatusIndicatorProps {
  hasCredentials: boolean;
  apiSource: "env" | "manual" | null;
  lastFetched: Date | null;
  isTestnet: boolean;
  currentBaseUrl: string | null;
  onCredentialsSubmit: (credentials: BybitCredentials) => void;
  isLoading: boolean;
}

const APIStatusIndicator = ({
  hasCredentials,
  apiSource,
  lastFetched,
  isTestnet,
  currentBaseUrl,
  onCredentialsSubmit,
  isLoading
}: APIStatusIndicatorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string>("");
  
  // Extract domain from full URL if available
  const apiDomain = currentBaseUrl ? 
    currentBaseUrl.replace("https://", "").replace("http://", "") : 
    null;
  
  useEffect(() => {
    if (!lastFetched) return;
    
    const updateTimeAgo = () => {
      const seconds = Math.floor((new Date().getTime() - lastFetched.getTime()) / 1000);
      
      if (seconds < 60) return setTimeAgo(`${seconds} seconds ago`);
      if (seconds < 3600) return setTimeAgo(`${Math.floor(seconds / 60)} minutes ago`);
      if (seconds < 86400) return setTimeAgo(`${Math.floor(seconds / 3600)} hours ago`);
      return setTimeAgo(`${Math.floor(seconds / 86400)} days ago`);
    };
    
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [lastFetched]);

  return (
    <div className="flex items-center space-x-2">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <Badge 
                variant={hasCredentials ? (isTestnet ? "warning" : "success") : "outline"} 
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5"
              >
                {hasCredentials ? (
                  <>
                    <WifiHigh className="h-3.5 w-3.5" />
                    <span>{isTestnet ? "TESTNET" : "API Connected"}</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3.5 w-3.5" />
                    <span>API Not Connected</span>
                  </>
                )}
              </Badge>

              {hasCredentials && apiSource && (
                <Badge variant="outline" className="text-xs">
                  {apiSource === "env" ? ".env file" : "Custom API Key"}
                </Badge>
              )}
              
              {hasCredentials && apiDomain && (
                <Badge variant="info" className="text-xs">
                  {apiDomain}
                </Badge>
              )}
              
              <SheetTrigger asChild>
                <Badge variant="outline" className="cursor-pointer p-1">
                  <Settings className="h-3.5 w-3.5" />
                </Badge>
              </SheetTrigger>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {hasCredentials 
              ? `API credentials ${apiSource === "env" ? "loaded from .env file" : "manually entered"}${lastFetched ? ` • Last fetched: ${timeAgo}` : ""}${apiDomain ? ` • Endpoint: ${apiDomain}` : ""}`
              : "Configure API credentials"}
          </TooltipContent>
        </Tooltip>
        
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>API Settings</SheetTitle>
            <SheetDescription>
              Configure your Bybit API credentials to fetch your P2P trade data.
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-8 space-y-6">
            {apiSource === "env" && (
              <div className="rounded-md bg-muted p-4 text-sm">
                <p>Currently using API credentials from your <code className="text-primary">.env</code> file.</p>
                <p className="mt-2">Environment: <strong>{isTestnet ? "Testnet" : "Mainnet"}</strong></p>
                {!isTestnet && apiDomain && (
                  <p className="mt-2">Endpoint: <strong>{apiDomain}</strong></p>
                )}
                
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>To update these values, edit your <code>.env</code> file in the project root.</p>
                </div>
              </div>
            )}
            
            <ApiCredentialsForm 
              onCredentialsSubmit={(creds) => {
                onCredentialsSubmit(creds);
                setIsOpen(false);
              }}
              isLoading={isLoading}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default APIStatusIndicator;
