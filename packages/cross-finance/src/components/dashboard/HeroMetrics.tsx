
import { TrendingUp, TrendingDown, DollarSign, Activity, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HeroMetricProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning';
}

function HeroMetric({ title, value, change, changeLabel, icon, variant = 'default' }: HeroMetricProps) {
  const isPositive = change && change >= 0;
  
  const variantStyles = {
    default: 'from-blue-50 to-blue-100 border-blue-200',
    success: 'from-emerald-50 to-emerald-100 border-emerald-200',
    warning: 'from-amber-50 to-amber-100 border-amber-200'
  };

  return (
    <Card className={cn("overflow-hidden bg-gradient-to-br", variantStyles[variant])}>
      <CardContent className="p-6 text-black">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {change !== undefined && (
              <div className={cn("flex items-center text-sm font-medium",
                isPositive ? "text-emerald-600" : "text-red-600"
              )}>
                {isPositive ? (
                  <TrendingUp className="mr-1 h-4 w-4" />
                ) : (
                  <TrendingDown className="mr-1 h-4 w-4" />
                )}
                <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
                {changeLabel && <span className="ml-1 text-muted-foreground">{changeLabel}</span>}
              </div>
            )}
          </div>
          <div className="rounded-full p-3 bg-white/80 shadow-sm">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface HeroMetricsProps {
  netProfit: number;
  totalVolume: number;
  totalBalance: number;
  exchangeRate: number;
  exchangeRateChange: number;
}

export function HeroMetrics({ 
  netProfit, 
  totalVolume, 
  totalBalance, 
  exchangeRate,
  exchangeRateChange 
}: HeroMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <HeroMetric
        title="Net Profit"
        value={new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: 'NGN',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(netProfit)}
        change={8.2}
        changeLabel="vs last period"
        icon={<TrendingUp className="h-6 w-6 text-emerald-600" />}
        variant="default"
      />
      
      <HeroMetric
        title="Volume Processed"
        value={new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: 'NGN',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(totalVolume)}
        change={12.5}
        changeLabel="vs last period"
        icon={<Activity className="h-6 w-6 text-blue-600" />}
        variant="default"
      />
      
      <HeroMetric
        title="Total Balance"
        value={`$${totalBalance.toLocaleString()}`}
        change={5.2}
        changeLabel="vs yesterday"
        icon={<Wallet className="h-6 w-6 text-amber-600" />}
        variant="default"
      />
    </div>
  );
}
