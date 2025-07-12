import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";

interface DebugControlsProps {
  debugMode: boolean;
  onToggleDebugMode: () => void;
  className?: string;
}

export const DebugControls = ({
  debugMode,
  onToggleDebugMode,
  className = "",
}: DebugControlsProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggleDebugMode}
      className={`github-focus ${className}`}
    >
      <Bug className="h-3.5 w-3.5 mr-2" />
      {debugMode ? "Disable Debug" : "Enable Debug"}
    </Button>
  );
};
