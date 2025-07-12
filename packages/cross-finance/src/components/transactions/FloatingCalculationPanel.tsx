
import { Card } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

interface FloatingCalculationPanelProps {
  amountReceived: number;
  usdcSpent: string;
  profit: number;
  isVisible: boolean;
}

export function FloatingCalculationPanel({ 
  amountReceived, 
  usdcSpent, 
  profit, 
  isVisible 
}: FloatingCalculationPanelProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-6 right-6 z-50 p-4 bg-white/95 backdrop-blur-sm border shadow-lg min-w-[280px] animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="h-4 w-4 text-blue-600" />
        <h3 className="font-semibold text-sm text-gray-800">Live Calculation</h3>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount Received:</span>
          <span className="font-bold text-green-600">
            {formatCurrency(amountReceived)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">USDC Spent:</span>
          <span className="font-mono">
            {formatCurrency(parseFloat(usdcSpent) || 0)}
          </span>
        </div>
        
        <div className="border-t pt-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Profit:</span>
            <span className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(profit)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
