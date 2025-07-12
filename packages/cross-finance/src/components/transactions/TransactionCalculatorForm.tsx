import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { calculateTransaction, formatCurrency } from '@/utils/transactionCalculations';
import { TransactionFormData, FXTransaction, TransactionStatus, TransactionType } from '@/types/transactions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  currency: z.enum(['USD', 'GBP', 'CAD', 'EUR']),
  customerAmount: z.string().min(1, 'Customer amount is required'),
  rateSold: z.string().min(1, 'Rate sold is required'),
  rateBought: z.string().min(1, 'Rate bought is required'),
  clientName: z.string().optional(),
  transactionDate: z.date(),
});

interface Props {
  onTransactionSaved: (transaction: FXTransaction) => void;
}

export function TransactionCalculatorForm({ onTransactionSaved }: Props) {
  const { data: exchangeData } = useExchangeRate();
  const [calculation, setCalculation] = useState({
    usdtEquivalent: 0,
    totalNgnReceived: 0,
    totalNgnCost: 0,
    profit: 0
  });

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: 'USD',
      customerAmount: '',
      rateSold: '',
      rateBought: '',
      clientName: '',
      transactionDate: new Date(),
    },
  });

  const watchedValues = form.watch();

  // Real-time calculation
  useState(() => {
    const { customerAmount, rateSold, rateBought } = watchedValues;
    
    if (customerAmount && rateSold && rateBought && exchangeData) {
      const customerAmountNum = parseFloat(customerAmount);
      const rateSoldNum = parseFloat(rateSold);
      const rateBoughtNum = parseFloat(rateBought);
      
      if (!isNaN(customerAmountNum) && !isNaN(rateSoldNum) && !isNaN(rateBoughtNum)) {
        const result = calculateTransaction(
          customerAmountNum,
          rateSoldNum,
          rateBoughtNum,
          exchangeData.rate
        );
        setCalculation(result);
      }
    }
  });

  const onSubmit = (data: TransactionFormData) => {
    const transaction: FXTransaction = {
      id: Date.now().toString(),
      currency: data.currency,
      amount: calculation.totalNgnReceived,
      status: TransactionStatus.PENDING,
      type: TransactionType.BUY,
      customerAmount: parseFloat(data.customerAmount),
      rateSold: parseFloat(data.rateSold),
      rateBought: parseFloat(data.rateBought),
      usdtEquivalent: calculation.usdtEquivalent,
      totalNgnReceived: calculation.totalNgnReceived,
      totalNgnCost: calculation.totalNgnCost,
      profit: calculation.profit,
      clientName: data.clientName,
      transactionDate: data.transactionDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Required payment structure fields
      originalAmount: calculation.totalNgnReceived,
      paidAmount: 0,
      remainingBalance: calculation.totalNgnReceived,
      isFullyPaid: false,
    };

    onTransactionSaved(transaction);
    form.reset();
    setCalculation({ usdtEquivalent: 0, totalNgnReceived: 0, totalNgnCost: 0, profit: 0 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Transaction Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Amount Ordered</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 10000"
                        type="number"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rateSold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Sold in USDT</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 1.32"
                        type="number"
                        step="0.001"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rateBought"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Bought USDT</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 1.30"
                        type="number"
                        step="0.001"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name / Tag (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Client identifier" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Transaction Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Save Transaction
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calculation Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>USDT Equivalent</Label>
            <div className="text-2xl font-bold">
              {formatCurrency(calculation.usdtEquivalent, 'USDT')} USDT
            </div>
          </div>

          <div className="space-y-2">
            <Label>Total NGN Received</Label>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(calculation.totalNgnReceived)}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Total NGN Cost</Label>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(calculation.totalNgnCost)}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Profit</Label>
            <div className={`text-3xl font-bold ${calculation.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(calculation.profit)}
            </div>
          </div>

          <div className="text-sm text-muted-foreground mt-4">
            <p>USDT/NGN Rate: {formatCurrency(exchangeData?.rate || 0)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
