
import { Filter, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rail } from '@/data/railsData';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from './DatePickerWithRange';

interface FilterBarProps {
  filterStatus: string | null;
  filterRail: string | null;
  dateFilter: [Date | null, Date | null];
  searchQuery: string;
  setFilterStatus: (status: string | null) => void;
  setFilterRail: (rail: string | null) => void;
  setDateFilter: (dates: [Date | null, Date | null]) => void;
  setSearchQuery: (query: string) => void;
  railsData: Rail[];
}

export function FilterBar({
  filterStatus,
  filterRail,
  dateFilter,
  searchQuery,
  setFilterStatus,
  setFilterRail,
  setDateFilter,
  setSearchQuery,
  railsData
}: FilterBarProps) {
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateFilter([range.from, range.to]);
    } else {
      setDateFilter([null, null]);
    }
  };
  
  const hasActiveFilters = filterStatus || filterRail || dateFilter[0] || dateFilter[1] || searchQuery;

  const formatRailDisplay = (rail: Rail) => {
    if (rail.pricingModel === 'free') return `${rail.name} - Free`;
    if (rail.pricingModel === 'bps') return `${rail.name} - ${rail.baseFee}bps`;
    if (rail.pricingModel === 'bps_plus_fixed') return `${rail.name} - ${rail.baseFee}bps + $${rail.fixedFee}`;
    return rail.name;
  };
  
  return (
    <div className="space-y-4 mb-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by reference, beneficiary or transaction ID..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter by:</span>
        </div>
        
        {/* Status filter */}
        <Select
          value={filterStatus || "all_statuses"}
          onValueChange={(value) => setFilterStatus(value === "all_statuses" ? null : value)}
        >
          <SelectTrigger className="h-8 w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_statuses">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Awaiting MT103">Awaiting MT103</SelectItem>
            <SelectItem value="MT103 Received">MT103 Received</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Rail filter */}
        <Select
          value={filterRail || "all_rails"}
          onValueChange={(value) => setFilterRail(value === "all_rails" ? null : value)}
        >
          <SelectTrigger className="h-8 w-[200px]">
            <SelectValue placeholder="Banking Partner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_rails">All Partners</SelectItem>
            {railsData.map(rail => (
              <SelectItem key={rail.id} value={rail.name}>
                {formatRailDisplay(rail)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Date range filter */}
        <DatePickerWithRange 
          date={{
            from: dateFilter[0],
            to: dateFilter[1]
          }}
          onChange={handleDateRangeChange}
        />
        
        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setFilterStatus(null);
              setFilterRail(null);
              setDateFilter([null, null]);
              setSearchQuery('');
            }}
            className="h-8"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
