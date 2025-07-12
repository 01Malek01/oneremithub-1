
import { useState, useEffect } from 'react';
import { DailyTransaction } from '@/types/transactions';
import { CompactStatsHeader } from '@/components/transactions/CompactStatsHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { filterTransactionsByPeriod, getPeriodLabel, TimePeriod } from '@/utils/dateFilters';

const STORAGE_KEY = 'daily-transactions';

export function TransactionAnalytics() {
  const [transactions, setTransactions] = useState<DailyTransaction[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('daily');

  // Load transactions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTransactions(parsed);
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    }
  }, []);

  // Filter transactions by selected period
  const filteredTransactions = filterTransactionsByPeriod(transactions, selectedPeriod);

  // Calculate metrics
  const totalProfit = filteredTransactions.reduce((sum, tx) => sum + tx.profit, 0);
  const totalAmountReceived = filteredTransactions.reduce((sum, tx) => sum + tx.amountReceived, 0);
  const totalUsdcSpent = filteredTransactions.reduce((sum, tx) => sum + tx.usdcSpent, 0);
  const totalVolumeProcessed = filteredTransactions.reduce((sum, tx) => sum + tx.amountProcessed, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Transaction Analytics</h2>
        <p className="text-muted-foreground">Overview of your transaction performance and metrics</p>
      </div>

      {/* Time Period Selector */}
      <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as TimePeriod)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium">{getPeriodLabel(selectedPeriod)} Performance</h3>
            <p className="text-sm text-muted-foreground">
              {filteredTransactions.length} transactions processed
            </p>
          </div>

          {/* Enhanced Stats Header with Volume */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Net Profit */}
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg">
              <div className="text-sm text-emerald-700 font-medium">Net Profit</div>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-800' : 'text-red-600'}`}>
                {new Intl.NumberFormat('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(totalProfit)}
              </div>
            </div>

            {/* Total Volume Processed */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-700 font-medium">Volume Processed</div>
              <div className="text-2xl font-bold text-blue-800">
                {new Intl.NumberFormat('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(totalVolumeProcessed)}
              </div>
            </div>

            {/* Total Received */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg">
              <div className="text-sm text-green-700 font-medium">Total Received</div>
              <div className="text-2xl font-bold text-green-800">
                {new Intl.NumberFormat('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(totalAmountReceived)}
              </div>
            </div>

            {/* Total Spent */}
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
              <div className="text-sm text-orange-700 font-medium">Total Spent</div>
              <div className="text-2xl font-bold text-orange-800">
                {new Intl.NumberFormat('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(totalUsdcSpent)}
              </div>
            </div>

            {/* Transaction Count */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
              <div className="text-sm text-purple-700 font-medium">Transactions</div>
              <div className="text-2xl font-bold text-purple-800">
                {filteredTransactions.length}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
