import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionFilters, Currency, TransactionStatus, TransactionType } from '@/types/transactions';
import { X, Filter } from 'lucide-react';

interface TransactionsFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: Partial<TransactionFilters>) => void;
  onClearFilters: () => void;
}

export const TransactionsFilters = memo(({
  filters,
  onFiltersChange,
  onClearFilters,
}: TransactionsFiltersProps) => {
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search transactions..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
          />
        </div>

        {/* Currency Filter */}
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={filters.currency || ''}
            onValueChange={(value) => onFiltersChange({ currency: value as Currency })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All currencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All currencies</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="CAD">CAD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status || ''}
            onValueChange={(value) => onFiltersChange({ status: value as TransactionStatus })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value={TransactionStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={TransactionStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={TransactionStatus.FAILED}>Failed</SelectItem>
              <SelectItem value={TransactionStatus.PROCESSING}>Processing</SelectItem>
              <SelectItem value={TransactionStatus.CANCELLED}>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={filters.type || ''}
            onValueChange={(value) => onFiltersChange({ type: value as TransactionType })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value={TransactionType.BUY}>Buy</SelectItem>
              <SelectItem value={TransactionType.SELL}>Sell</SelectItem>
              <SelectItem value={TransactionType.TRANSFER}>Transfer</SelectItem>
              <SelectItem value={TransactionType.EXCHANGE}>Exchange</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amount Range */}
        <div className="space-y-2">
          <Label>Amount Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Min amount"
              type="number"
              value={filters.minAmount || ''}
              onChange={(e) => onFiltersChange({ 
                minAmount: e.target.value ? parseFloat(e.target.value) : undefined 
              })}
            />
            <Input
              placeholder="Max amount"
              type="number"
              value={filters.maxAmount || ''}
              onChange={(e) => onFiltersChange({ 
                maxAmount: e.target.value ? parseFloat(e.target.value) : undefined 
              })}
            />
          </div>
        </div>

        {/* Client Name */}
        <div className="space-y-2">
          <Label htmlFor="clientName">Client Name</Label>
          <Input
            id="clientName"
            placeholder="Filter by client..."
            value={filters.clientName || ''}
            onChange={(e) => onFiltersChange({ clientName: e.target.value })}
          />
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Active Filters:
            </p>
            <div className="flex flex-wrap gap-1">
              {filters.currency && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Currency: {filters.currency}
                </span>
              )}
              {filters.status && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Status: {filters.status}
                </span>
              )}
              {filters.type && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  Type: {filters.type}
                </span>
              )}
              {filters.search && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  Search: {filters.search}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TransactionsFilters.displayName = 'TransactionsFilters'; 