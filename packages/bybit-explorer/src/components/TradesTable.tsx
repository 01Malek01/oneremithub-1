import { useEffect, useState, useCallback } from "react";
import { OrderDetailsDialog } from "./OrderDetails";

import { Download, Calendar, FileDown } from "lucide-react";
import { format, subDays } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Order, P2POrderFilter, STATUS_MAP } from "@/lib/types/bybit-api-types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatNairaAmount, formatNumber, formatTokenQuantity } from "@/lib/utils";
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  Eye,
  ExternalLink,
  Search,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface TradesTableProps {
  trades: Order[];
  onFilterChange?: (filters: P2POrderFilter) => Promise<void>;
  isLoading?: boolean;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
}

const TradesTable = ({ trades, onFilterChange, isLoading, onLoadMore, hasMore }: TradesTableProps) => {
  const isMobile = useIsMobile();
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>(undefined);
  const [selectedTrades, setSelectedTrades] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<Order | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filter trades based on selected filter and search
  useEffect(() => {
    console.log(selectedFilter || "No filter selected");
    if (onFilterChange && selectedFilter) {
      onFilterChange({ filter: Number(selectedFilter) });
    }
  }, [selectedFilter, onFilterChange]);
  
  const filteredTrades = trades.filter(trade => {
    const matchesFilter = selectedFilter 
      ? Number(trade.filter) === Number(selectedFilter)
      : true;
    
    const matchesSearch = searchQuery
      ? trade.orderNumber.toString().includes(searchQuery) ||
        trade.tokenId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.targetNickName.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    return matchesFilter && matchesSearch;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTrades(new Set(filteredTrades.map(trade => trade.orderNumber.toString())));
    } else {
      setSelectedTrades(new Set());
    }
  };

  const handleSelectTrade = (orderNumber: string, checked: boolean) => {
    const newSelected = new Set(selectedTrades);
    if (checked) {
      newSelected.add(orderNumber);
    } else {
      newSelected.delete(orderNumber);
    }
    setSelectedTrades(newSelected);
  };

  const getFilterBadge = (filter: string) => {
    const filterText = STATUS_MAP[filter] || filter;
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";

    if (filter === "50") variant = "default"; // Completed
    else if (filter === "40" || filter === "80") variant = "destructive"; // Cancelled
    else if (["5", "10", "20", "60", "90", "110"].includes(filter)) variant = "outline"; // In progress
    else if (["30", "70", "100"].includes(filter)) variant = "secondary"; // Disputed

    return (
      <Badge variant={variant} className="text-xs">
        {filterText}
      </Badge>
    );
  };

  const viewDetails = (trade: Order) => {
    setSelectedTrade(trade);
  };

  const exportToCSV = useCallback(() => {
    try {
      setIsExporting(true);
      
      if (trades.length === 0) {
        alert('No trades to export');
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
      const csvRows = trades.map(trade => {
        const date = trade.createDate ? new Date(Number(trade.createDate)).toISOString() : '';
        const status = Object.entries(STATUS_MAP).find(([code]) => code === trade.filter)?.[1] || trade.filter;
        
        return [
          `"${trade.orderNumber}"`,
          `"${date}"`,
          `"${trade.side}"`,
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
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export trades. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [trades]);
  return (
    <Card className="w-full overflow-hidden border border-slate-700/50 bg-slate-900/90 backdrop-blur-sm shadow-2xl github-fade-in">
      {/* Enhanced Header with filters and search */}
      <div className="p-4 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-slate-100">
              Recent Trades
            </h3>
            <Badge variant="outline" className="text-xs border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50">
              {filteredTrades.length} of {trades.length}
            </Badge>
          </div>
  
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search trades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 bg-slate-800/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 text-slate-400 hover:text-slate-100 hover:bg-slate-700/50"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
  
            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Select
                value={selectedFilter ?? "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    setSelectedFilter(undefined);
                  } else {
                    setSelectedFilter(value);
                  }
                }}
              >
                <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-600 text-slate-100 focus:border-blue-400 focus:ring-blue-400/20">
                  <SelectValue placeholder="All Filters" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 text-slate-100">
                  <SelectItem value="all" className="focus:bg-slate-700 focus:text-slate-100">All Filters</SelectItem>
                  {Object.entries(STATUS_MAP).map(([code, label]) => (
                    <SelectItem key={code} value={code} className="focus:bg-slate-700 focus:text-slate-100">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
  
            <div className="flex items-center gap-2">
              {selectedTrades.size > 0 && (
                <Button variant="outline" size="sm" className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 transition-all duration-200">
                  Actions ({selectedTrades.size})
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 transition-all duration-200"
                disabled={isExporting || trades.length === 0}
                onClick={exportToCSV}
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Trades
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
  
      {/* Table */}
      <div className="overflow-auto max-h-[60vh] bg-slate-900/50">
        <Table>
          <TableHeader className="sticky top-0 bg-slate-800/80 backdrop-blur-sm">
            <TableRow className="border-slate-700/50 hover:bg-slate-800/30">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTrades.size === filteredTrades.length && filteredTrades.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 focus:ring-blue-400/20"
                />
              </TableHead>
              <TableHead className="font-semibold text-slate-300">
                <div className="flex items-center gap-2">
                  Order ID
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </TableHead>
              {!isMobile && <TableHead className="font-semibold text-slate-300">Side</TableHead>}
              <TableHead className="font-semibold text-slate-300">Filter</TableHead>
              <TableHead className="font-semibold text-slate-300">Token</TableHead>
              {!isMobile && <TableHead className="font-semibold text-right text-slate-300">Price</TableHead>}
              {!isMobile && <TableHead className="font-semibold text-right text-slate-300">Quantity</TableHead>}
              {!isMobile && <TableHead className="font-semibold text-slate-300">Counterparty</TableHead>}
              <TableHead className="font-semibold text-slate-300">Date</TableHead>
              <TableHead className="font-semibold text-right text-slate-300">Amount (NGN)</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrades.length > 0 ? (
              filteredTrades.map((trade, index) => (
                <TableRow 
                  key={trade.orderNumber} 
                  className="border-slate-700/30 hover:bg-slate-800/40 transition-all duration-200 group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedTrades.has(trade.orderNumber.toString())}
                      onCheckedChange={(checked) => 
                        handleSelectTrade(trade.orderNumber.toString(), checked as boolean)
                      }
                      className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 focus:ring-blue-400/20"
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-300">
                    {trade.orderNumber}
                  </TableCell>
                  {!isMobile && (
                    <TableCell>
                      <Badge 
                        variant={trade.side === 'BUY' ? "default" : "secondary"}
                        className={`text-xs font-medium ${
                          trade.side === 'BUY' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                        }`}
                      >
                        {trade.side}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    {getFilterBadge(trade.filter)}
                  </TableCell>
                  <TableCell className="font-medium text-slate-200">
                    {trade.tokenId || '-'}
                  </TableCell>
                  {!isMobile && (
                    <TableCell className="text-right font-mono text-slate-300">
                      {trade.price ? formatNumber(trade.price) : '-'}
                    </TableCell>
                  )}
                  {!isMobile && (
                    <TableCell className="text-right font-mono text-slate-300">
                      {trade.notifyTokenQuantity ? formatTokenQuantity(trade.notifyTokenQuantity) : '-'}
                    </TableCell>
                  )}
                  {!isMobile && (
                    <TableCell className="max-w-32 truncate text-slate-300">
                      {trade.targetNickName || '-'}
                    </TableCell>
                  )}
                  <TableCell className="text-sm text-slate-400">
                    {trade.createDate ? new Date(Number(trade.createDate)).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-green-400">
                    {trade.amount ? `₦${formatNairaAmount(trade.amount)}` : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-100 hover:bg-slate-700/50"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-slate-800 border-slate-600 text-slate-100">
                        <DropdownMenuItem className="focus:bg-slate-700 focus:text-slate-100" onClick={() => viewDetails(trade)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-slate-700 focus:text-slate-100">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open in Bybit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isMobile ? 8 : 11} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-300">No trades found</p>
                      <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Enhanced Load More Button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center p-6 border-t border-slate-700/50 bg-slate-800/30">
          <Button 
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
            className="min-w-[200px] border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-slate-100 hover:border-blue-400/50 transition-all duration-300"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent mr-2" />
                Loading...
              </>
            ) : (
              "Load More Trades"
            )}
          </Button>
        </div>
      )}
  
      {/* Order Details Dialog */}
      {selectedTrade && (
        <OrderDetailsDialog
          order={selectedTrade}
          open={!!selectedTrade} /** if selectedTrade is not null, open the dialog */
          onOpenChange={(open) => !open && setSelectedTrade(null)} 
        />
      )}
    </Card>
  );
};

export default TradesTable;
