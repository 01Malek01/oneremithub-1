
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | null;
  trendValue?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  trend, 
  trendValue,
  icon,
  className 
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h4 className="text-2xl font-bold mt-1">{value}</h4>
            
            {trend && (
              <div className={cn("mt-1 text-sm flex items-center", 
                trend === 'up' ? "text-success" : "text-destructive"
              )}>
                {trend === 'up' ? (
                  <TrendingUp className="mr-1 h-4 w-4" />
                ) : (
                  <TrendingDown className="mr-1 h-4 w-4" />
                )}
                <span>{trendValue}</span>
              </div>
            )}
            
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          
          {icon && (
            <div className="rounded-full p-2 bg-primary/10">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
