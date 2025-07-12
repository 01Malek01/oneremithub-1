
import { useState, useEffect } from 'react';
import { DailyTransaction, DailyTransactionFormData, PaymentScheduleType } from '@/types/transactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePickerSection } from './DatePickerSection';
import { TransactionInputFields } from './TransactionInputFields';
import { CalculationResults } from './CalculationResults';

interface CurrencyTabProps {
  currency: 'USD' | 'GBP' | 'CAD' | 'EUR';
  onTransactionSaved: (transaction: DailyTransaction) => void;
}

export function CurrencyTab({ currency, onTransactionSaved }: CurrencyTabProps) {
  const [formData, setFormData] = useState<DailyTransactionFormData>({
    currency,
    nairaUsdtRate: '',
    amountProcessed: '',
    usdcSpent: '',
    transactionDate: new Date(),
    paymentScheduleType: PaymentScheduleType.LUMP_SUM,
    originalAmount: '',
  });

  const [calculations, setCalculations] = useState({
    amountReceived: 0,
    profit: 0
  });

  // Real-time calculations
  useEffect(() => {
    const { nairaUsdtRate, amountProcessed, usdcSpent } = formData;
    
    if (nairaUsdtRate && amountProcessed) {
      const rate = parseFloat(nairaUsdtRate);
      const amount = parseFloat(amountProcessed);
      const spent = parseFloat(usdcSpent) || 0;
      
      if (!isNaN(rate) && !isNaN(amount)) {
        const amountReceived = rate * amount;
        const profit = amountReceived - spent;
        
        setCalculations({ amountReceived, profit });
      }
    } else {
      setCalculations({ amountReceived: 0, profit: 0 });
    }
  }, [formData.nairaUsdtRate, formData.amountProcessed, formData.usdcSpent]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date: Date) => {
    setFormData(prev => ({ ...prev, transactionDate: date }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nairaUsdtRate || !formData.amountProcessed || !formData.usdcSpent) {
      return;
    }

    const transaction: DailyTransaction = {
      id: Date.now().toString(),
      currency: formData.currency,
      amount: calculations.amountReceived,
      status: 'pending' as any,
      type: 'buy' as any,
      nairaUsdtRate: parseFloat(formData.nairaUsdtRate),
      amountProcessed: parseFloat(formData.amountProcessed),
      usdcSpent: parseFloat(formData.usdcSpent),
      amountReceived: calculations.amountReceived,
      profit: calculations.profit,
      transactionDate: formData.transactionDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      originalAmount: calculations.amountReceived,
      paidAmount: 0,
      remainingBalance: calculations.amountReceived,
      isFullyPaid: false,
    };

    onTransactionSaved(transaction);
    
    // Reset form but keep the date and rate
    setFormData(prev => ({
      ...prev,
      amountProcessed: '',
      usdcSpent: '',
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">{currency} Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <DatePickerSection 
                transactionDate={formData.transactionDate}
                onDateChange={handleDateChange}
              />

              <TransactionInputFields
                currency={currency}
                nairaUsdtRate={formData.nairaUsdtRate}
                amountProcessed={formData.amountProcessed}
                usdcSpent={formData.usdcSpent}
                onInputChange={handleInputChange}
              />
            </div>

            {/* Calculation Results */}
            <div className="space-y-4">
              <CalculationResults
                amountReceived={calculations.amountReceived}
                usdcSpent={formData.usdcSpent}
                profit={calculations.profit}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={!formData.nairaUsdtRate || !formData.amountProcessed || !formData.usdcSpent}
          >
            Save Transaction
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
