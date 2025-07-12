
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AccountCardProps {
  name: string;
  balance: number;
  currency: string;
  limit?: number;
  className?: string;
}

export function AccountCard({ name, balance, currency, limit, className }: AccountCardProps) {
  const utilization = limit ? Math.min((balance / limit) * 100, 100) : null;
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(balance);
  
  const formattedLimit = limit ? new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(limit) : null;
  
  let utilizationColor = "bg-primary";
  if (utilization && utilization > 80) {
    utilizationColor = "bg-destructive";
  } else if (utilization && utilization > 50) {
    utilizationColor = "bg-warning";
  }
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Balance</span>
            <span className="font-mono font-medium text-lg">{formattedBalance}</span>
          </div>
          
          {limit && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Limit</span>
                <span className="text-sm font-medium">{formattedLimit}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Utilization</span>
                  <span className="text-xs font-medium">{Math.round(utilization)}%</span>
                </div>
                <Progress value={utilization} className={cn("h-1.5", utilizationColor)} />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
