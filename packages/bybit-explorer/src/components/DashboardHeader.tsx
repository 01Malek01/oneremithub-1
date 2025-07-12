
import { RefreshCw, User, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import APIStatusIndicator from "./APIStatusIndicator";
import { BybitCredentials, P2POrderFilter } from "@/lib/bybit-api";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardHeaderProps {
  totalTrades: number;
  hasCredentials: boolean;
  apiSource: "env" | "manual" | null;
  lastFetched: Date | null;
  isTestnet: boolean;
  currentBaseUrl: string | null;
  onRefresh: () => void;
  onCredentialsSubmit: (credentials: BybitCredentials) => void;
  isLoading: boolean;
}

const DashboardHeader = ({ 
  totalTrades, 
  hasCredentials, 
  apiSource, 
  lastFetched, 
  isTestnet,
  currentBaseUrl,
  onRefresh, 
  onCredentialsSubmit,
  isLoading
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Bybit P2P Trades</h1>
          {isTestnet && (
            <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-medium px-2.5 py-1 rounded-full">
              TestNet
            </span>
          )}
        </div>
        <p className="text-muted-foreground">
          View and manage your peer-to-peer cryptocurrency trades
        </p>
      </div>
      
      <div className="flex items-center space-x-4 self-end md:self-auto">
        <APIStatusIndicator
          hasCredentials={hasCredentials}
          apiSource={apiSource}
          lastFetched={lastFetched}
          isTestnet={isTestnet}
          currentBaseUrl={currentBaseUrl}
          onCredentialsSubmit={onCredentialsSubmit}
          isLoading={isLoading}
        />
        
        {hasCredentials && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onRefresh} 
                disabled={isLoading}
                className="border-border/60"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh trade data</TooltipContent>
          </Tooltip>
        )}
      </div>
      
      {totalTrades > 0 && (
        <div className="flex items-center gap-4 bg-card p-4 rounded-lg ml-auto md:ml-0 border shadow-sm">
          <div className="bg-primary rounded-full p-2.5">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Trades</p>
            <p className="text-2xl font-semibold">{totalTrades.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
