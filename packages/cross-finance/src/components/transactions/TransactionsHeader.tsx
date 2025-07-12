import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface TransactionsHeaderProps {
  totalTransactions: number;
  totalVolume: number;
  totalProfit: number;
  isLoading?: boolean;
}

export const TransactionsHeader = memo(({ 
  totalTransactions, 
  totalVolume, 
  totalProfit, 
  isLoading = false 
}: TransactionsHeaderProps) => {
  const isProfitPositive = totalProfit >= 0;
  const profitChange = 12.5; // This would come from analytics API
  const volumeChange = 8.2; // This would come from analytics API

  return (
    <div className="space-y-6">
      {/* Main header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive transaction management and analytics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {isLoading ? 'Loading...' : `${totalTransactions} total`}
          </Badge>
          <Badge variant="outline" className="text-sm">
            Real-time
          </Badge>
        </div>
      </div>

      {/* Analytics overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Volume
                </p>
                <p className="text-2xl font-bold">
                  {isLoading ? '...' : formatCurrency(totalVolume)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">
                    +{volumeChange}% from last month
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Profit
                </p>
                <p className={`text-2xl font-bold ${isProfitPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isLoading ? '...' : formatCurrency(totalProfit)}
                </p>
                <div className="flex items-center mt-1">
                  {isProfitPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${isProfitPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isProfitPositive ? '+' : ''}{profitChange}% from last month
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Success Rate
                </p>
                <p className="text-2xl font-bold">
                  {isLoading ? '...' : '98.5%'}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">
                    +2.1% from last month
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

TransactionsHeader.displayName = 'TransactionsHeader'; 