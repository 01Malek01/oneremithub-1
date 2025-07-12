
import { Card } from '@/components/ui/card';

interface Props {
  totalAmountReceived: number;
  totalUsdcSpent: number;
  totalProfit: number;
}

export function TransactionSummaryCards({ 
  totalAmountReceived, 
  totalUsdcSpent, 
  totalProfit 
}: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-6 pb-4">
      <div className="bg-green-50 p-3 rounded-lg">
        <div className="text-xs text-green-700">Total Received</div>
        <div className="text-lg font-bold text-green-800">
          {formatCurrency(totalAmountReceived)}
        </div>
      </div>
      <div className="bg-orange-50 p-3 rounded-lg">
        <div className="text-xs text-orange-700">Total Spent</div>
        <div className="text-lg font-bold text-orange-800">
          {formatCurrency(totalUsdcSpent)}
        </div>
      </div>
      <div className={`p-3 rounded-lg ${totalProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
        <div className={`text-xs ${totalProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
          Net Profit
        </div>
        <div className={`text-lg font-bold ${totalProfit >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
          {formatCurrency(totalProfit)}
        </div>
      </div>
    </div>
  );
}
