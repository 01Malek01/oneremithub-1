
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface ExchangeRate {
  buyRate: number;
  sellRate: number;
  lastUpdated: Date;
  change: number;
}

export function CurrencyConverter() {
  const [amount, setAmount] = useState<string>('1000');
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('buy');
  
  // Mock exchange rate
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>({
    buyRate: 1280.50,
    sellRate: 1310.75,
    lastUpdated: new Date(),
    change: 1.2,
  });
  
  // Effect to calculate conversion
  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    const rate = activeTab === 'buy' ? exchangeRate.buyRate : exchangeRate.sellRate;
    setConvertedAmount(numAmount * rate);
  }, [amount, activeTab, exchangeRate]);
  
  // Format as currency
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Currency Converter</CardTitle>
            <CardDescription>USDT to NGN exchange calculator</CardDescription>
          </div>
          <div className="flex items-center">
            <Badge variant={exchangeRate.change >= 0 ? "outline" : "destructive"} className="flex items-center gap-1">
              {exchangeRate.change >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(exchangeRate.change)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="buy">Buy USDT</TabsTrigger>
            <TabsTrigger value="sell">Sell USDT</TabsTrigger>
          </TabsList>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="usdtAmount">USDT Amount</Label>
                <Input 
                  id="usdtAmount"
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  className="font-mono text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>NGN Amount</Label>
                  <span className="text-xs text-muted-foreground">
                    Rate: {formatCurrency(activeTab === 'buy' ? exchangeRate.buyRate : exchangeRate.sellRate, 'NGN')}
                  </span>
                </div>
                <div className="relative">
                  <Input 
                    value={formatCurrency(convertedAmount, 'NGN').replace('NGN', '').trim()}
                    readOnly
                    className="font-mono text-lg"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    NGN
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                Last updated: {formatTime(exchangeRate.lastUpdated)}
              </div>
              <Button>
                <span>Convert Now</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
