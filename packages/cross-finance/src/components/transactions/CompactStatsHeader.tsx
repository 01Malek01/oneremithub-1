
import { Card } from '@/components/ui/card';

interface CompactStatsHeaderProps {
  totalProfit: number;
  totalReceived: number;
  totalSpent: number;
  transactionCount: number;
}

export function CompactStatsHeader({ 
  totalProfit, 
  totalReceived, 
  totalSpent, 
  transactionCount 
}: CompactStatsHeaderProps) {
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
      <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
        <div className="text-sm text-emerald-700 font-medium">Net Profit</div>
        <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-800' : 'text-red-600'}`}>
          {formatCurrency(totalProfit)}
        </div>
      </Card>
      
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="text-sm text-blue-700 font-medium">Total Received</div>
        <div className="text-2xl font-bold text-blue-800">
          {formatCurrency(totalReceived)}
        </div>
      </Card>
      
      <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <div className="text-sm text-orange-700 font-medium">Total Spent</div>
        <div className="text-2xl font-bold text-orange-800">
          {formatCurrency(totalSpent)}
        </div>
      </Card>
      
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="text-sm text-purple-700 font-medium">Transactions</div>
        <div className="text-2xl font-bold text-purple-800">
          {transactionCount}
        </div>
      </Card>
    </div>
  );
}
