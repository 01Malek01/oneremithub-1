
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DailyTransaction } from '@/types/transactions';
import { filterTransactionsByPeriod, TimePeriod } from '@/utils/dateFilters';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface PerformanceOverviewProps {
  transactions: DailyTransaction[];
}

export function PerformanceOverview({ transactions }: PerformanceOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('daily');

  const filteredTransactions = filterTransactionsByPeriod(transactions, selectedPeriod);
  const transactionCount = filteredTransactions.length;

  const metrics = {
    totalProfit: filteredTransactions.reduce((sum, tx) => sum + tx.profit, 0),
    totalReceived: filteredTransactions.reduce((sum, tx) => sum + tx.amountReceived, 0),
    totalSpent: filteredTransactions.reduce((sum, tx) => sum + tx.usdcSpent, 0),
    avgProfit: transactionCount > 0 ? filteredTransactions.reduce((sum, tx) => sum + tx.profit, 0) / transactionCount : 0,
  };

  const getPeriodLabel = (period: TimePeriod): string => {
    switch (period) {
      case 'daily': return 'Today';
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      case 'yearly': return 'This Year';
      default: return 'Today';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Performance Overview</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {transactionCount} transactions • {getPeriodLabel(selectedPeriod)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            {isExpanded ? 'Less Details' : 'View Details'}
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Quick Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-semibold text-emerald-600">
              {new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN',
                notation: 'compact',
                maximumFractionDigits: 1,
              }).format(metrics.totalProfit)}
            </div>
            <div className="text-xs text-muted-foreground">Net Profit</div>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-semibold">
              {new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN',
                notation: 'compact',
                maximumFractionDigits: 1,
              }).format(metrics.totalReceived)}
            </div>
            <div className="text-xs text-muted-foreground">Total Received</div>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-semibold">
              {new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN',
                notation: 'compact',
                maximumFractionDigits: 1,
              }).format(metrics.totalSpent)}
            </div>
            <div className="text-xs text-muted-foreground">Total Spent</div>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-semibold">{transactionCount}</div>
            <div className="text-xs text-muted-foreground">Transactions</div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as TimePeriod)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedPeriod} className="mt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded">
                    <span className="text-sm font-medium">Average Profit per Transaction</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('en-NG', {
                        style: 'currency',
                        currency: 'NGN',
                        maximumFractionDigits: 0,
                      }).format(metrics.avgProfit)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded">
                    <span className="text-sm font-medium">Profit Margin</span>
                    <span className="font-semibold">
                      {metrics.totalReceived > 0 ? ((metrics.totalProfit / metrics.totalReceived) * 100).toFixed(2) : 0}%
                    </span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
