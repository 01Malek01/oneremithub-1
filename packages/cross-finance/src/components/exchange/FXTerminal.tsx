
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, ArrowRight, DollarSign } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ExchangeRate {
  buyRate: number;
  sellRate: number;
  lastUpdated: Date;
  change: number;
  dailyHigh: number;
  dailyLow: number;
  volume: number;
}

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export function FXTerminal() {
  const [amount, setAmount] = useState<string>('1000');
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('buy');
  const [orderType, setOrderType] = useState<string>('market');
  const [baseCurrency, setBaseCurrency] = useState<string>('USDT');
  const [quoteCurrency, setQuoteCurrency] = useState<string>('NGN');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  
  // Mock exchange rate
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>({
    buyRate: 1280.50,
    sellRate: 1310.75,
    lastUpdated: new Date(),
    change: 1.2,
    dailyHigh: 1325.00,
    dailyLow: 1275.25,
    volume: 1450000,
  });

  // Mock balances
  const [balances, setBalances] = useState({
    USDT: 5000,
    NGN: 7500000,
    BTC: 0.25,
    ETH: 3.5
  });

  // Mock supported currencies
  const currencies: CurrencyOption[] = [
    { code: 'USDT', name: 'Tether', symbol: '$' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
    { code: 'ETH', name: 'Ethereum', symbol: 'Ξ' },
  ];
  
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
      second: '2-digit',
    });
  };

  // Handle quick amount selections
  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  // Calculate fees (mock)
  const calculateFees = () => {
    const numAmount = parseFloat(amount) || 0;
    return numAmount * 0.001; // 0.1% fee
  };

  // Get currency symbol
  const getCurrencySymbol = (code: string) => {
    return currencies.find(c => c.code === code)?.symbol || code;
  };

  // Calculate spread
  const calculateSpread = () => {
    return exchangeRate.sellRate - exchangeRate.buyRate;
  };

  // Random rate updates (for UI demonstration)
  useEffect(() => {
    const interval = setInterval(() => {
      const fluctuation = (Math.random() - 0.5) * 2;
      setExchangeRate(prev => ({
        ...prev,
        buyRate: +(prev.buyRate + fluctuation).toFixed(2),
        sellRate: +(prev.sellRate + fluctuation).toFixed(2),
        lastUpdated: new Date(),
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>FX Terminal</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span>{baseCurrency}/{quoteCurrency} Exchange</span>
              <Badge variant={exchangeRate.change >= 0 ? "outline" : "destructive"} className="flex items-center gap-1 bg-success/20">
                {exchangeRate.change >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(exchangeRate.change)}%
              </Badge>
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">24h High:</span>
              <span className="font-mono font-medium">{formatCurrency(exchangeRate.dailyHigh, 'NGN').replace('NGN', '₦')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">24h Low:</span>
              <span className="font-mono font-medium">{formatCurrency(exchangeRate.dailyLow, 'NGN').replace('NGN', '₦')}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="buy" className="data-[state=active]:bg-success/20 data-[state=active]:text-success">Buy {baseCurrency}</TabsTrigger>
            <TabsTrigger value="sell" className="data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive">Sell {baseCurrency}</TabsTrigger>
          </TabsList>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">Order Type:</span>
                  <Select value={orderType} onValueChange={setOrderType}>
                    <SelectTrigger className="w-28 h-8">
                      <SelectValue placeholder="Order Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  Spread: <span className="font-mono">{calculateSpread().toFixed(2)}</span>
                </span>
                <Badge variant="outline" className="text-xs">
                  Volume: {formatCurrency(exchangeRate.volume, 'USD').replace('$', '')}
                </Badge>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                  <SelectTrigger className="w-24 h-10">
                    <SelectValue placeholder="From" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={quoteCurrency} onValueChange={setQuoteCurrency}>
                  <SelectTrigger className="w-24 h-10">
                    <SelectValue placeholder="To" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-xs text-muted-foreground">
                {activeTab === 'buy' ? 'Bid' : 'Ask'}: 
                <span className="ml-2 font-mono font-medium text-sm">
                  {getCurrencySymbol(quoteCurrency)}{activeTab === 'buy' ? exchangeRate.buyRate : exchangeRate.sellRate}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="baseAmount">{baseCurrency} Amount</Label>
                  <span className="text-xs text-muted-foreground">
                    Balance: {getCurrencySymbol(baseCurrency)}{balances[baseCurrency as keyof typeof balances].toLocaleString()}
                  </span>
                </div>
                <Input 
                  id="baseAmount"
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  className="font-mono text-lg"
                />
                <div className="flex gap-2 pt-1">
                  {[100, 500, 1000, 5000].map((value) => (
                    <Button 
                      key={value} 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleQuickAmount(value)}
                      className="text-xs px-3"
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{quoteCurrency} Amount</Label>
                  <span className="text-xs text-muted-foreground">
                    Balance: {getCurrencySymbol(quoteCurrency)}{balances[quoteCurrency as keyof typeof balances].toLocaleString()}
                  </span>
                </div>
                <div className="relative">
                  <Input 
                    value={formatCurrency(convertedAmount, 'NGN').replace('NGN', '').trim()}
                    readOnly
                    className="font-mono text-lg"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    {quoteCurrency}
                  </div>
                </div>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="w-full"
            >
              {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
            </Button>

            {showAdvancedOptions && (
              <div className="space-y-4 border rounded-md p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stopLoss">Stop Loss ({getCurrencySymbol(quoteCurrency)})</Label>
                    <Input 
                      id="stopLoss"
                      type="number"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="font-mono"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="takeProfit">Take Profit ({getCurrencySymbol(quoteCurrency)})</Label>
                    <Input 
                      id="takeProfit"
                      type="number"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      className="font-mono"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Slippage Tolerance</Label>
                    <span className="text-xs">1.0%</span>
                  </div>
                  <Slider defaultValue={[1]} max={5} step={0.1} />
                </div>
              </div>
            )}
            
            <div className="border-t pt-4">
              <div className="flex justify-between text-sm mb-4">
                <span className="text-muted-foreground">Fee:</span>
                <span className="font-mono">{getCurrencySymbol(baseCurrency)}{calculateFees().toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Last updated: {formatTime(exchangeRate.lastUpdated)}
                </div>
                <Button 
                  className={activeTab === 'buy' ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'}
                >
                  <span>{activeTab === 'buy' ? 'Buy' : 'Sell'} {baseCurrency}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
