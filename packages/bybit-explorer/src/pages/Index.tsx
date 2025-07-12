import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { BybitCredentials, Order, P2POrderFilter, STATUS_MAP } from "@/lib/types/bybit-api-types";
import ApiCredentialsForm from "@/components/ApiCredentialsForm";
import TradesTable from "@/components/TradesTable";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { DashboardStats } from "@/components/DashboardStats";
import { Card } from "@/components/ui/card";
import { FileSpreadsheet, Zap, Calendar, Download, Bug } from "lucide-react";
import { format } from "date-fns";
import { formatNairaAmount } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toggleDebugMode, getDebugMode } from "@/lib/utils/bybit-utils";
import { fetchP2POrders } from "@/lib/api/FetchP2POrders";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import new components
import { UserSwitcher } from "@/components/trade/UserSwitcher";
import { DebugControls } from "@/components/trade/DebugControls";
import { ExportControls } from "@/components/trade/ExportControls";
import { TradeDataFetcher } from "@/components/trade/TradeDataFetcher";
import { ErrorDisplay } from "@/components/trade/ErrorDisplay";
import { LoadingState } from "@/components/trade/LoadingState";
import { fetchUserInfo } from "@/lib/api/FetchUserInfo";

// Define UserCredential type since it's not exported from bybit-api-types
type UserCredential = {
  name: string;
  apiKey: string;
  apiSecret: string;
};



const initialUsers: UserCredential[] = [
  {
    name: "IDRIS ADEBAYO MOSHOOD",
    apiKey: import.meta.env.VITE_BYBIT_API_KEY_1 || "",
    apiSecret: import.meta.env.VITE_BYBIT_API_SECRET_1 || "",

  },
  {
    name: "IDRISTHEGUY",
    apiKey: import.meta.env.VITE_BYBIT_API_KEY_2 || "",
    apiSecret: import.meta.env.VITE_BYBIT_API_SECRET_2 || "",


  },
  {
    name: "GANIYU SODIQ OLAYINKA",
    apiKey: import.meta.env.VITE_BYBIT_API_KEY_3 || "",
    apiSecret: import.meta.env.VITE_BYBIT_API_SECRET_3 || "",
   
  },
  {
    name: "Sodeeq Abiodun Olaniyan",
    apiKey: import.meta.env.VITE_BYBIT_API_KEY_4 || "",
    apiSecret: import.meta.env.VITE_BYBIT_API_SECRET_4 || "",

    },
];

const Index = () => {
  const [trades, setTrades] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [apiSource, setApiSource] = useState<"env" | "manual" | null>(null);
  const [currentBaseUrl, setCurrentBaseUrl] = useState<string | null>(null);
  const [filters, setFilters] = useState<P2POrderFilter>({});
  const [debugMode, setDebugMode] = useState<boolean>(getDebugMode());
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [users, setUsers] = useState<UserCredential[]>(initialUsers);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [onlineState, setOnlineState] = useState([]);

  const credentials = users[selectedUserIndex];
  const useTestnet = import.meta.env.VITE_BYBIT_USE_TESTNET === 'true';

  const fetchMoreTrades = useCallback(async (pageNumber: number, orderFilters?: P2POrderFilter) => {
    try {
      setIsLoading(true);
      setError(null);

      const nextPage = pageNumber + 1;
      setCurrentPage(nextPage);
      
      const orders = await fetchP2POrders(
        credentials.apiKey, 
        credentials.apiSecret, 
        nextPage, 
        orderFilters
      );

      // Calculate total pages based on the count from API
      const totalCount = orders.result.count;
      const calculatedTotalPages = Math.ceil(totalCount / 30);
      setTotalPages(calculatedTotalPages);

      // Debug logging for raw API response
      if (getDebugMode()) {
        console.debug('Raw API Response:', {
          items: orders.result.items,
          firstItem: orders.result.items[0],
          totalCount,
          totalPages: calculatedTotalPages,
          sampleValues: orders.result.items.slice(0, 3).map(item => ({
            price: item.price,
            amount: item.amount,
            notifyTokenQuantity: item.notifyTokenQuantity,
            rawItem: item
          }))
        });
      }

      // Convert API response data format to Order type
      const ordersList: Order[] = orders.result.items.map((item: any, index: number) => ({
        orderNumber: trades.length + index + 1,
        id: item.id?.toString() || '',
        side: item.side === 0 ? 'BUY' : 'SELL',
        filter: item.status?.toString() || '',
        tokenId: item.tokenId?.toString() || 'N/A',
        price: item.price?.toString() || 'N/A',
        notifyTokenQuantity: item.notifyTokenQuantity?.toString() || 'N/A',
        targetNickName: item.targetNickName?.toString() || 'N/A',
        createDate: item.createDate?.toString() || '',
        sellerRealName: item.sellerRealName?.toString() || 'N/A',
        buyerRealName: item.buyerRealName?.toString() || 'N/A',
        amount: item.amount?.toString() || 'N/A'
      }));

      if (ordersList.length === 0) {
        setHasMore(false);
        toast.dismiss();
        toast.warning("No more trades found. You have reached the end of your trade history.");
        setCurrentPage(pageNumber); // Revert to previous page number
        return;
      }

      setTrades((prev) => [...prev, ...ordersList]);
      setLastFetched(new Date());
      setHasMore(nextPage < calculatedTotalPages);

      toast.dismiss();
      toast.success(`Successfully fetched ${ordersList.length} more trades${calculatedTotalPages > 0 ? ` (Page ${nextPage} of ${calculatedTotalPages})` : ''}`);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error("Failed to fetch trades:", error);
      
      // Handle rate limit errors specifically
      if (errorMessage.includes('rate limit') || errorMessage.includes('10006')) {
        setError("Rate limit exceeded. The system will automatically retry in a few seconds. Please wait...");
        toast.dismiss();
        toast.error("Rate limit exceeded. Retrying automatically...");
        
        // Retry after a delay
        setTimeout(() => {
          fetchMoreTrades(pageNumber, orderFilters);
        }, 5000); // Wait 5 seconds before retrying
        return;
      }
      
      setError(errorMessage);
      toast.dismiss();
      toast.error(`Error: ${errorMessage}`);
      setCurrentPage(pageNumber); // Revert to previous page number on error
    } finally {
      setIsLoading(false);
    }
  }, [trades.length, credentials]);

  const fetchTrades = useCallback(async (pageNumber: number, orderFilters?: P2POrderFilter, customCredentials?: BybitCredentials) => {
    try {
      const credentialsToUse = customCredentials || credentials;
      if (!credentialsToUse?.apiKey || !credentialsToUse?.apiSecret) {
        setError("No API credentials available");
        return;
      }

      setIsLoading(true);
      setError(null);
      setHasMore(true);

      // Use the provided filters or default to last 7 days
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      
      const params: P2POrderFilter = {
        page: pageNumber,
        size: 30,
        beginTime: orderFilters?.beginTime ? Number(orderFilters.beginTime) : sevenDaysAgo,
        endTime: orderFilters?.endTime ? Number(orderFilters.endTime) : now,
        ...(orderFilters?.status !== undefined && { status: orderFilters.status }),
        ...(orderFilters?.tokenId && { tokenId: orderFilters.tokenId }),
        ...(orderFilters?.side && { side: orderFilters.side }),
      };

      const orders = await fetchP2POrders(
        credentialsToUse.apiKey, 
        credentialsToUse.apiSecret, 
        pageNumber, 
        params
      );

      // Calculate total pages based on the count from API
      const totalCount = orders.result.count;
      const calculatedTotalPages = Math.ceil(totalCount / 30);
      setTotalPages(calculatedTotalPages);

      // Debug logging for raw API response
      if (getDebugMode()) {
        console.debug('Raw API Response:', {
          items: orders.result.items,
          firstItem: orders.result.items[0],
          totalCount,
          totalPages: calculatedTotalPages,
          sampleValues: orders.result.items.slice(0, 3).map(item => ({
            price: item.price,
            amount: item.amount,
            notifyTokenQuantity: item.notifyTokenQuantity,
            rawItem: item
          }))
        });
      }

      // Convert API response data format to Order type
      const ordersList: Order[] = orders.result.items.map((item: any, index: number) => ({
        orderNumber: (pageNumber - 1) * 30 + index + 1,
        id: item.id?.toString() || '',
        side: item.side === 0 ? 'BUY' : 'SELL',
        filter: item.status?.toString() || '',
        tokenId: item.tokenId?.toString() || 'N/A',
        price: item.price?.toString() || 'N/A',
        notifyTokenQuantity: item.notifyTokenQuantity?.toString() || 'N/A',
        targetNickName: item.targetNickName?.toString() || 'N/A',
        createDate: item.createDate?.toString() || '',
        sellerRealName: item.sellerRealName?.toString() || 'N/A',
        buyerRealName: item.buyerRealName?.toString() || 'N/A',
        amount: item.amount?.toString() || 'N/A'
      }));

      setTrades(ordersList);
      setLastFetched(new Date());
      setHasMore(ordersList.length === 30 && pageNumber < calculatedTotalPages);

      toast.dismiss();
      if (ordersList.length === 0) {
        toast.warning("No trades found. Check if your API key has the correct permissions or try different filters.");
      } else {
        toast.success(`Successfully fetched ${ordersList.length} trades${calculatedTotalPages > 0 ? ` (Page ${pageNumber} of ${calculatedTotalPages})` : ''}`);
      }
    } catch (error: any) {
      console.error("Failed to fetch trades:", error);
      
      // Handle rate limit errors specifically
      if (error.message?.includes('rate limit') || error.message?.includes('10006')) {
        setError("Rate limit exceeded. The system will automatically retry in a few seconds. Please wait...");
        toast.dismiss();
        toast.error("Rate limit exceeded. Retrying automatically...");
        
        // Retry after a delay
        setTimeout(() => {
          fetchTrades(pageNumber, orderFilters);
        }, 5000); // Wait 5 seconds before retrying
        return;
      }
      
      setError(error.message || "Failed to fetch trades. Check console for details.");
      toast.dismiss();
      toast.error(`Error: ${error.message}`);
      } finally {
      setIsLoading(false);
    }
  }, [credentials]);

  const handleCredentialsSubmit = async (newCredentials: BybitCredentials) => {
    // Update the selected user's credentials
    const updatedUsers = [...users];
    updatedUsers[selectedUserIndex] = {
      ...updatedUsers[selectedUserIndex],
      ...newCredentials
    };
    setUsers(updatedUsers);
    
    setApiSource("manual");
    setCurrentPage(1);
    await fetchTrades(1);
  };
useEffect(() => {
  const fetchStatuses = async () => {
    if (users.length === 0) return;
    console.log(`[${new Date().toLocaleTimeString()}] Refreshing user statuses...`);
    const results = await Promise.all(
      users.map(async (user) => {
        try {
          const res = await fetchUserInfo(user.apiKey, user.apiSecret);
          return { name: user.name, online: res.result.isOnline };
        } catch (error) {
          console.error(`Failed to fetch status for user: ${user.name}`, error);
          return { name: user.name, online: false }; // Default to offline on error
        }
      })
    );
    setOnlineState(results);
  };

  fetchStatuses();
  const intervalId = setInterval(fetchStatuses, 1 *60 *1000); // Refresh every 1 min

  return () => clearInterval(intervalId);
}, [users]);
  const handleRefresh = async () => {
    setCurrentPage(1);
    await fetchTrades(1, filters);
  };

  const handleFilterChange = async (newFilters: P2POrderFilter) => {
    setFilters(newFilters);
    setCurrentPage(1);
    await fetchTrades(1, newFilters);
  };

  const handleLoadMore = async () => {
    if (hasMore) {
      await fetchMoreTrades(currentPage, filters);
    }
  };

  const handleToggleDebugMode = () => {
    const newDebugMode = toggleDebugMode();
    setDebugMode(newDebugMode);
    toast.info(`Debug mode ${newDebugMode ? 'enabled' : 'disabled'}`);
  };

  const exportToCSV = useCallback(async (days: number) => {
    if (!credentials?.apiKey || !credentials?.apiSecret) {
      toast.error('API credentials are required');
      return;
    }

    try {
      setIsExporting(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      toast.info(`Fetching trades for the last ${days} ${days === 1 ? 'day' : 'days'}...`);
      
      // Fetch trades for the selected date range
      let allTrades: any[] = [];
      let currentPage = 1;
      const pageSize = 30; // Max allowed by API
      let hasMore = true;
      
      // Helper for delay
      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

      // Helper for retry logic
      async function fetchWithRetry(apiKey: string, apiSecret: string, page: number, params: any, retries = 3) {
        let lastError;
        for (let attempt = 0; attempt < retries; attempt++) {
          try {
            return await fetchP2POrders(apiKey, apiSecret, page, params);
          } catch (err) {
            lastError = err;
            if (attempt < retries - 1) {
              toast.warning(`Request failed, retrying... (${attempt + 1}/${retries - 1})`);
              await delay(500); // wait before retry
            }
          }
        }
        throw lastError;
      }

      // Fetch all pages of results
      while (hasMore) {
        const response = await fetchWithRetry(
          credentials.apiKey,
          credentials.apiSecret,
          currentPage,
          {
            beginTime: startDate.getTime(),
            endTime: endDate.getTime(),
            page: currentPage,
            size: pageSize
          }
        );
        
        if (!response?.result?.items?.length) {
          break;
        }
        
        allTrades = [...allTrades, ...response.result.items];
        hasMore = response.result.items.length === pageSize;
        currentPage++;
        await delay(300); // Add 300ms delay between requests
      }

      if (allTrades.length === 0) {
        toast.warning(`No trades found in the last ${days} days`);
        return;
      }

      // Define CSV headers
      const headers = [
        'Order Number',
        'Date',
        'Side',
        'Status',
        'Token',
        'Price',
        'Quantity',
        'Amount (NGN)',
        'Counterparty'
      ];

      // Convert trades to CSV rows
      const csvRows = allTrades.map((trade, index) => {
        const date = trade.createDate ? new Date(Number(trade.createDate)).toISOString() : '';
        const status = STATUS_MAP[trade.status?.toString()] || trade.status?.toString() || '';
        const side = trade.side === 0 ? 'BUY' : 'SELL';
        
        return [
          `"${index + 1}"`,
          `"${date}"`,
          `"${side}"`,
          `"${status}"`,
          `"${trade.tokenId || ''}"`,
          `"${trade.price || ''}"`,
          `"${trade.notifyTokenQuantity || ''}"`,
          `"${trade.amount ? formatNairaAmount(trade.amount) : ''}"`,
          `"${trade.targetNickName || ''}"`
        ].join(',');
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...csvRows
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `trades_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${allTrades.length} trades to CSV`);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Failed to export trades. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [credentials]);
 

  useEffect(() => {
    if (users.length > 0 && users[selectedUserIndex]?.apiKey && users[selectedUserIndex]?.apiSecret) {
      setApiSource(apiSource === null ? "env" : apiSource);
      fetchTrades(1);
    }
  }, [selectedUserIndex, users, fetchTrades, apiSource]);

  useEffect(() => {
    if (users[selectedUserIndex]?.apiKey && users[selectedUserIndex]?.apiSecret) {
      fetchTrades(currentPage);
    }
  }, [currentPage, selectedUserIndex, users, fetchTrades]);

  const handleUserChange = useCallback( async (userIndex: number , retryCount: number = 3) => {
    setSelectedUserIndex(userIndex);
    setTrades([]); // Clear previous trades
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    
    // Get the selected user's credentials directly from the users array
    const selectedUser = users[userIndex];
    if (!selectedUser) {
      setError("No user selected");
      return;
    }
    
    // Create a new credentials object to ensure we're using the latest values
    const updatedCredentials = {
      apiKey: selectedUser.apiKey,
      apiSecret: selectedUser.apiSecret
    };
    
    // Pass the credentials directly to fetchTrades
    await fetchTrades(1, undefined, updatedCredentials);
 
  }, [users, fetchTrades]);

  return (
    // <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-900/90 flex-col">
        {/* <AppSidebar /> */}
        {/* <SidebarInset className="flex flex-col flex-1"> */}
          <TopNavigation 
            onRefresh={handleRefresh}
            onExport={exportToCSV}
            isLoading={isLoading}
            isExporting={isExporting}
            isConnected={!!credentials} 
            lastFetched={lastFetched}
            hasTrades={trades.length > 0}
          />

          <main className="flex-1 p-6 space-y-6 overflow-auto">
            {/* User Switcher */}
            <div className="flex items-center md:gap-4 mb-2">
  {/* All users' status row */}
  <div className="flex items-center gap-3 flex-wrap text-white ">
    {users.map(user => {
      const state = onlineState.find(s => s.name === user.name);
      return (
        <span key={user.name} className="flex items-center gap-1 text-xs">
          <span style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: state?.online ? '#22c55e' : '#ef4444',
          }} />
          {user.name}
        </span>
      );
    })}
  </div>
  <button
    className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs font-medium border border-gray-300 text-black"
    onClick={async () => {
      const results = await Promise.all(
        users.map(async (user) => {
          try {
            const res = await fetchUserInfo(user.apiKey, user.apiSecret);
            return { name: user.name, online: res.result.isOnline };
          } catch {
            return { name: user.name, online: false };
          }
        })
      );
      setOnlineState(results);
    }}
    type="button"
  >
    Refresh Status
  </button>
</div>
<UserSwitcher 
  users={users} 
  selectedUserIndex={selectedUserIndex} 
  onUserChange={handleUserChange} 
/>

            {/* Dashboard Stats */}
            {trades.length > 0 && (
              <DashboardStats trades={trades} />
            )}

            {/* Error Display */}
            <ErrorDisplay 
              error={error} 
              onToggleDebugMode={handleToggleDebugMode} 
              debugMode={debugMode} 
            />

            {/* Loading State */}
            <LoadingState isLoading={isLoading} />

            {/* API Credentials Form */}
            {!isLoading && trades.length === 0 && !credentials && (
              <Card className="p-6 border border-border/50 bg-card/50 backdrop-blur-sm github-fade-in">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Connect Your Account</h3>
                      <p className="text-sm text-muted-foreground">Enter your Bybit API credentials to get started</p>
                    </div>
                  </div>
                  <ApiCredentialsForm 
                    onCredentialsSubmit={handleCredentialsSubmit}
                    isLoading={isLoading}
                  />
                </div>
              </Card>
            )}

            {/* No Data State */}
            {!isLoading && trades.length === 0 && credentials && !error && (
              <Card className="p-12 border border-border/50 bg-card/50 backdrop-blur-sm github-fade-in">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                    <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">No Trades Found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      We couldn't find any P2P trades in your account. Ensure your API key has the correct permissions for P2P trading.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3">
                    <div className="flex gap-2">
                      <Button onClick={handleRefresh} className="github-focus">
                        Try Again
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="gap-2"
                            disabled={isExporting || trades.length === 0}
                          >
                            {isExporting ? (
                              <>
                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                Exporting...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                Export
                              </>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => exportToCSV(7)}
                            className="cursor-pointer"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Last 7 days
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => exportToCSV(30)}
                            className="cursor-pointer"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Last 30 days
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => exportToCSV(90)}
                            className="cursor-pointer"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Last 90 days
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => exportToCSV(365)}
                            className="cursor-pointer"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Last 365 days
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <DebugControls 
                      debugMode={debugMode} 
                      onToggleDebugMode={handleToggleDebugMode} 
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Trades Table */}
            {trades.length > 0 && (
              <TradesTable 
                trades={trades} 
                onFilterChange={handleFilterChange} 
                isLoading={isLoading}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
              />
            )}

            {/* Debug Controls */}
            {trades.length > 0 && (
              <Card className="p-4 border border-border/50 bg-muted/20 backdrop-blur-sm github-fade-in">
                <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleToggleDebugMode}
                      className="github-focus"
                    >
                      <Bug className="h-3.5 w-3.5 mr-2" />
                      {debugMode ? "Disable Debug" : "Enable Debug"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                        }
                      }}
                      disabled={currentPage === 1}
                      size="sm"
                      variant="outline"
                      className="github-focus"
                    >
                      Previous
                    </Button>
                    <div className="bg-background px-3 py-1 rounded-md border border-border text-sm font-medium">
                      {totalPages > 0 ? `Page ${currentPage} of ${totalPages}` : `Page ${currentPage}`}
                    </div>
                    <Button
                      onClick={() => {
                        if (hasMore) {
                          setCurrentPage(currentPage + 1);
                        }
                      }}
                      disabled={!hasMore}
                      size="sm"
                      variant="outline"
                      className="github-focus"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Footer
            <Card className="p-6 border border-border/50 bg-muted/10 backdrop-blur-sm github-fade-in">
              <div className="text-center text-sm text-muted-foreground space-y-2">
                <p>This application communicates directly with the Bybit API. Your credentials are never stored.</p>
                <p>For security, we recommend using read-only API keys with P2P trading permissions only.</p>
              </div>
            </Card> */}
          </main>
        {/* </SidebarInset> */}
      </div>
    // </SidebarProvider>
  );
};

export default Index;