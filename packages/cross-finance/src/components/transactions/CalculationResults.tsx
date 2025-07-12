
import { Label } from '@/components/ui/label';

interface CalculationResultsProps {
  amountReceived: number;
  usdcSpent: string;
  profit: number;
}

export function CalculationResults({ amountReceived, usdcSpent, profit }: CalculationResultsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="p-4 bg-muted/50 rounded-lg">
      <h3 className="font-semibold mb-4">Calculation Results</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Amount Received:</Label>
          <span className="text-lg font-bold text-green-600">
            {formatCurrency(amountReceived)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <Label>USDC Spent:</Label>
          <span className="text-lg font-mono">
            {formatCurrency(parseFloat(usdcSpent) || 0)}
          </span>
        </div>
        
        <div className="border-t pt-2">
          <div className="flex justify-between items-center">
            <Label>Profit:</Label>
            <span className={`text-xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(profit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
