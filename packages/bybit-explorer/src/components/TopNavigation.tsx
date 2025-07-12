
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Settings, 
  RefreshCw, 
  Download, 
  Activity,
  Wifi,
  WifiOff,
  Calendar
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TopNavigationProps {
  onRefresh?: () => void;
  onExport?: (days: number) => void;
  isLoading?: boolean;
  isExporting?: boolean;
  isConnected?: boolean;
  lastFetched?: Date | null;
  hasTrades?: boolean;
}

export function TopNavigation({ 
  onRefresh, 
  onExport,
  isLoading = false, 
  isExporting = false,
  isConnected = true,
  lastFetched,
  hasTrades = false
}: TopNavigationProps) {
  return (
    <div className="flex h-14 items-center gap-4 border-b bg-slate-900/90 backdrop-blur px-4">
      {/* Sidebar Trigger */}
      {/* <SidebarTrigger className="focus:ring-2 focus:ring-blue-500 focus:outline-none rounded" />
      <Separator orientation="vertical" className="h-6 bg-gray-700" /> */}
      
      <div className="flex flex-1 items-center gap-4">
        {/* Title Section */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-white">P2P Trades Dashboard</h1>
          <Badge variant="outline" className="text-xs bg-slate-800 text-gray-300 border-gray-700">
            v2.1.0
          </Badge>
        </div>
        
        {/* Right Side Controls */}
        <div className="ml-auto flex items-center gap-2">
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="hidden sm:inline">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="hidden sm:inline">Disconnected</span>
              </>
            )}
          </div>

          <Separator orientation="vertical" className="h-6 bg-gray-700" />

          {/* Last Updated */}
          {lastFetched && (
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
              <Activity className="w-4 h-4" />
              <span>Updated {lastFetched.toLocaleTimeString()}</span>
            </div>
          )}

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="focus:ring-2 focus:ring-blue-500 focus:outline-none rounded text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline ml-2">Refresh</span>
          </Button>

          {/* Export Dropdown */}
          {onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="focus:ring-2 focus:ring-blue-500 focus:outline-none rounded text-gray-300 hover:bg-gray-800 hover:text-white"
                  disabled={isExporting || !hasTrades}
                >
                  {isExporting ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline ml-2">
                    {isExporting ? 'Exporting...' : 'Export'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-gray-800 border-gray-700">
                <DropdownMenuItem 
                  onClick={() => onExport(1)}
                  className="cursor-pointer text-gray-300 hover:bg-gray-700 focus:bg-gray-700"
                >
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Last 24 hours 
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onExport(3)}
                  className="cursor-pointer text-gray-300 hover:bg-gray-700 focus:bg-gray-700"
                >
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Last 3 days
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onExport(7)}
                  className="cursor-pointer text-gray-300 hover:bg-gray-700 focus:bg-gray-700"
                >
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Last 7 days
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onExport(14)}
                  className="cursor-pointer text-gray-300 hover:bg-gray-700 focus:bg-gray-700"
                >
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Last 14 days
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onExport(30)}
                  className="cursor-pointer text-gray-300 hover:bg-gray-700 focus:bg-gray-700"
                >
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Last 30 days
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Separator orientation="vertical" className="h-6 bg-gray-700" />

          {/* Notification Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="focus:ring-2 focus:ring-blue-500 focus:outline-none rounded text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <Bell className="w-4 h-4" />
          </Button>

          {/* Settings Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="focus:ring-2 focus:ring-blue-500 focus:outline-none rounded text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
