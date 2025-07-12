
import { Card } from '@/components/ui/card';
import { DailyTransaction } from '@/types/transactions';
import { TrendingUp, DollarSign, Calendar, Activity } from 'lucide-react';

interface TransactionStatsHeaderProps {
  transactions: DailyTransaction[];
  activeCurrency: 'USD' | 'GBP' | 'CAD' | 'EUR';
}

export function TransactionStatsHeader({ transactions, activeCurrency }: TransactionStatsHeaderProps) {
  const filteredTransactions = transactions.filter(tx => tx.currency === activeCurrency);
  
  // Calculate today's metrics
  const today = new Date().toDateString();
  const todayTransactions = filteredTransactions.filter(
    tx => new Date(tx.transactionDate).toDateString() === today
  );
  
  const todayProfit = todayTransactions.reduce((sum, tx) => sum + tx.profit, 0);
  const totalVolume = filteredTransactions.reduce((sum, tx) => sum + tx.amountProcessed, 0);
  const totalProfit = filteredTransactions.reduce((sum, tx) => sum + tx.profit, 0);
  const avgProfit = filteredTransactions.length > 0 ? totalProfit / filteredTransactions.length : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600 mb-1">Today's Profit</p>
            <p className="text-2xl font-bold text-emerald-700">
              {formatCurrency(todayProfit)}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-emerald-600" />
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">Total Volume</p>
            <p className="text-2xl font-bold text-blue-700">
              {totalVolume.toLocaleString()} {activeCurrency}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-blue-600" />
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-600 mb-1">Total Profit</p>
            <p className="text-2xl font-bold text-purple-700">
              {formatCurrency(totalProfit)}
            </p>
          </div>
          <Activity className="h-8 w-8 text-purple-600" />
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-600 mb-1">Avg Profit</p>
            <p className="text-2xl font-bold text-amber-700">
              {formatCurrency(avgProfit)}
            </p>
          </div>
          <Calendar className="h-8 w-8 text-amber-600" />
        </div>
      </Card>
    </div>
  );
}
