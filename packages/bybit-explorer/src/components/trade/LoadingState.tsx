import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface LoadingStateProps {
  isLoading: boolean;
  message?: string;
  subMessage?: string;
  progress?: number;
}

export const LoadingState = ({
  isLoading,
  message = "Fetching trade data...",
  subMessage = "Connecting to Bybit API and retrieving your P2P trading history",
  progress = 30,
}: LoadingStateProps) => {
  if (!isLoading) return null;

  return (
    <Card className="p-8 border border-border/50 bg-card/50 backdrop-blur-sm github-fade-in">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="font-medium">{message}</p>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground">
          {subMessage}
        </p>
      </div>
    </Card>
  );
};
