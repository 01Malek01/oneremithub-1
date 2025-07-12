
import { useState, useEffect, useCallback } from 'react';
import { DailyTransaction, DailyTransactionFormData, PaymentScheduleType } from '@/types/transactions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CompactTransactionFormProps {
  onTransactionSaved: (transaction: DailyTransaction) => void;
  onCalculationChange: (calculations: { amountReceived: number; profit: number }) => void;
}

export function CompactTransactionForm({ onTransactionSaved, onCalculationChange }: CompactTransactionFormProps) {
  const [activeTab, setActiveTab] = useState<'USD' | 'GBP' | 'CAD' | 'EUR'>('USD');
  const [formData, setFormData] = useState<DailyTransactionFormData>({
    currency: activeTab,
    nairaUsdtRate: '',
    amountProcessed: '',
    usdcSpent: '',
    transactionDate: new Date(),
    paymentScheduleType: PaymentScheduleType.LUMP_SUM,
    originalAmount: '',
  });

  // Update form currency when tab changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, currency: activeTab }));
  }, [activeTab]);

  // Memoize the calculation function to prevent infinite loops
  const calculateValues = useCallback(() => {
    const { nairaUsdtRate, amountProcessed, usdcSpent } = formData;
    
    if (nairaUsdtRate && amountProcessed) {
      const rate = parseFloat(nairaUsdtRate);
      const amount = parseFloat(amountProcessed);
      const spent = parseFloat(usdcSpent) || 0;
      
      if (!isNaN(rate) && !isNaN(amount)) {
        const amountReceived = rate * amount;
        const profit = amountReceived - spent;
        return { amountReceived, profit };
      }
    }
    return { amountReceived: 0, profit: 0 };
  }, [formData.nairaUsdtRate, formData.amountProcessed, formData.usdcSpent]);

  // Real-time calculations with stable callback
  useEffect(() => {
    const calculations = calculateValues();
    onCalculationChange(calculations);
  }, [calculateValues, onCalculationChange]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, transactionDate: date }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nairaUsdtRate || !formData.amountProcessed || !formData.usdcSpent) {
      return;
    }

    const calculations = calculateValues();
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

  const currencies: Array<'USD' | 'GBP' | 'CAD' | 'EUR'> = ['USD', 'GBP', 'CAD', 'EUR'];

  return (
    <Card className="mb-6">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add New Transaction</h2>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList className="grid grid-cols-4 w-48">
              {currencies.map((currency) => (
                <TabsTrigger key={currency} value={currency} className="text-xs">
                  {currency}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-9 text-sm",
                      !formData.transactionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {formData.transactionDate ? (
                      format(formData.transactionDate, "MMM dd")
                    ) : (
                      <span>Pick date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.transactionDate}
                    onSelect={handleDateChange}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Rate */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">Rate (₦/USDT)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="1280.50"
                value={formData.nairaUsdtRate}
                onChange={(e) => handleInputChange('nairaUsdtRate', e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">Amount ({activeTab})</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="1000"
                value={formData.amountProcessed}
                onChange={(e) => handleInputChange('amountProcessed', e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>

            {/* USDC Spent */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">USDC Spent</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="1000000"
                value={formData.usdcSpent}
                onChange={(e) => handleInputChange('usdcSpent', e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <Button 
                type="submit" 
                className="w-full h-9"
                disabled={!formData.nairaUsdtRate || !formData.amountProcessed || !formData.usdcSpent}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
}
