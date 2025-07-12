
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TransactionInputFieldsProps {
  currency: 'USD' | 'GBP' | 'CAD' | 'EUR';
  nairaUsdtRate: string;
  amountProcessed: string;
  usdcSpent: string;
  onInputChange: (field: string, value: string) => void;
}

export function TransactionInputFields({
  currency,
  nairaUsdtRate,
  amountProcessed,
  usdcSpent,
  onInputChange
}: TransactionInputFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="rate">Naira/USDT Rate</Label>
        <Input
          id="rate"
          type="number"
          step="0.01"
          placeholder="e.g., 1280.50"
          value={nairaUsdtRate}
          onChange={(e) => onInputChange('nairaUsdtRate', e.target.value)}
          className="text-lg font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount Processed ({currency})</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="e.g., 1000"
          value={amountProcessed}
          onChange={(e) => onInputChange('amountProcessed', e.target.value)}
          className="text-lg font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="usdc">USDC Spent</Label>
        <Input
          id="usdc"
          type="number"
          step="0.01"
          placeholder="e.g., 1000000"
          value={usdcSpent}
          onChange={(e) => onInputChange('usdcSpent', e.target.value)}
          className="text-lg font-mono"
        />
      </div>
    </>
  );
}
