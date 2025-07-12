import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionAnalytics } from '@/types/transactions';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TransactionsAnalyticsProps {
  analytics: TransactionAnalytics | null;
  isLoading?: boolean;
}

export const TransactionsAnalytics = memo(({ analytics, isLoading = false }: TransactionsAnalyticsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <LoadingSpinner text="Loading analytics..." />
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold">{analytics.totalTransactions}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Volume</p>
            <p className="text-2xl font-bold">${analytics.totalVolume.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Profit</p>
            <p className="text-2xl font-bold">${analytics.totalProfit.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Profit Margin</p>
            <p className="text-2xl font-bold">{analytics.profitMargin.toFixed(1)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TransactionsAnalytics.displayName = 'TransactionsAnalytics'; 