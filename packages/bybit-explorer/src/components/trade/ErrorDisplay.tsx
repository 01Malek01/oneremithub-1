import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DebugControls } from "./DebugControls";

interface ErrorDisplayProps {
  error: string | null;
  onToggleDebugMode: () => void;
  debugMode: boolean;
}

export const ErrorDisplay = ({
  error,
  onToggleDebugMode,
  debugMode,
}: ErrorDisplayProps) => {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="border border-destructive/20 shadow-sm github-fade-in">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Connection Error</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{error}</p>
        {error.includes("permission") && (
          <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/20">
            <p className="text-sm font-medium">Quick Fix:</p>
            <p className="text-sm">
              Ensure your API key has <strong>Read permission for P2P trading</strong>. New API keys may take a few minutes to activate.
            </p>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <DebugControls 
            debugMode={debugMode} 
            onToggleDebugMode={onToggleDebugMode} 
          />
        </div>
      </AlertDescription>
    </Alert>
  );
};
