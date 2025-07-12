
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Rail } from '@/data/railsData';

interface RailComparisonCardProps {
  rails: Rail[];
  className?: string;
}

export function RailComparisonCard({ rails, className }: RailComparisonCardProps) {
  // Sort rails by cost efficiency (free first, then by baseFee)
  const sortedRails = [...rails].sort((a, b) => {
    if (a.pricingModel === 'free' && b.pricingModel !== 'free') return -1;
    if (b.pricingModel === 'free' && a.pricingModel !== 'free') return 1;
    return a.baseFee - b.baseFee;
  });

  const formatFee = (rail: Rail) => {
    if (rail.pricingModel === 'free') return 'Free';
    if (rail.pricingModel === 'bps') return `${rail.baseFee}bps`;
    if (rail.pricingModel === 'bps_plus_fixed') {
      return `${rail.baseFee}bps + $${rail.fixedFee}`;
    }
    return 'Custom';
  };

  const getFeeColorClass = (rail: Rail) => {
    if (rail.pricingModel === 'free') return 'text-green-600';
    if (rail.baseFee <= 5) return 'text-green-600';
    if (rail.baseFee <= 15) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Banking Partner Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedRails.map((rail) => (
            <div 
              key={rail.id}
              className={cn(
                "p-3 rounded-md border flex justify-between items-center",
                rail.recommended ? "border-primary bg-primary/5" : ""
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{rail.name}</span>
                  {rail.recommended && <Badge variant="outline" className="bg-primary/20">Recommended</Badge>}
                  {rail.pricingModel === 'free' && <Badge className="bg-green-100 text-green-800">FREE</Badge>}
                </div>
                <div className="text-sm text-muted-foreground">
                  {rail.processingTime} • {rail.specialization.join(', ')}
                </div>
              </div>
              <div className="text-right">
                <div className={cn("text-lg font-bold", getFeeColorClass(rail))}>
                  {formatFee(rail)}
                </div>
                <div className="text-xs text-muted-foreground">Pricing</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
