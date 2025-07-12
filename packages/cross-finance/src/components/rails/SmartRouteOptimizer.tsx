
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  Route, 
  Zap, 
  Clock, 
  DollarSign, 
  TrendingDown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Rail } from '@/data/railsData';

interface SmartRouteOptimizerProps {
  rails: Rail[];
  onSelectRail?: (rail: Rail) => void;
}

interface RouteRecommendation {
  rail: Rail;
  totalCost: number;
  costBreakdown: string;
  processingTime: string;
  suitabilityScore: number;
  pros: string[];
  cons: string[];
}

export function SmartRouteOptimizer({ rails, onSelectRail }: SmartRouteOptimizerProps) {
  const [amount, setAmount] = useState<number>(10000);
  const [currency, setCurrency] = useState<string>('USD');
  const [corridor, setCorridor] = useState<string>('');
  const [priority, setPriority] = useState<string>('cost'); // 'cost' or 'speed'
  const [recommendations, setRecommendations] = useState<RouteRecommendation[]>([]);

  const calculateRouteCost = (rail: Rail, amount: number, corridor: string): number => {
    if (rail.pricingModel === 'free') return 0;
    
    let baseFee = rail.baseFee;
    let fixedFee = rail.fixedFee || 0;

    // Check corridor-specific pricing
    if (rail.corridorPricing && corridor) {
      const corridorKey = corridor.toLowerCase().includes('china') ? 'china' : 'major';
      if (rail.corridorPricing[corridorKey]) {
        baseFee = rail.corridorPricing[corridorKey].baseFee;
        fixedFee = rail.corridorPricing[corridorKey].fixedFee || 0;
      }
    }

    const bpsAmount = (amount * baseFee) / 10000;
    return bpsAmount + fixedFee;
  };

  const getProcessingTimeScore = (processingTime: string): number => {
    // Convert processing time to hours for scoring
    if (processingTime.includes('minute')) return 100;
    if (processingTime.includes('hour')) {
      const hours = parseInt(processingTime.match(/\d+/)?.[0] || '24');
      return Math.max(0, 100 - hours * 2);
    }
    return 50;
  };

  const generateRecommendations = () => {
    if (!amount || amount <= 0) return;

    const recs: RouteRecommendation[] = rails
      .filter(rail => rail.status === 'online')
      .filter(rail => !rail.maxTransactionCap || amount <= rail.maxTransactionCap)
      .map(rail => {
        const totalCost = calculateRouteCost(rail, amount, corridor);
        const costPercentage = (totalCost / amount) * 100;
        const timeScore = getProcessingTimeScore(rail.processingTime);
        const integrationScore = rail.integrationStatus === 'api_integrated' ? 20 : 
                               rail.integrationStatus === 'api_ready' ? 10 : 0;
        
        let suitabilityScore = 0;
        if (priority === 'cost') {
          suitabilityScore = Math.max(0, 100 - costPercentage * 10) + integrationScore;
        } else {
          suitabilityScore = timeScore + integrationScore;
        }

        // Generate pros and cons
        const pros: string[] = [];
        const cons: string[] = [];

        if (rail.pricingModel === 'free') pros.push('Zero transaction fees');
        if (costPercentage < 0.5) pros.push('Very low cost');
        if (rail.integrationStatus === 'api_integrated') pros.push('Fully automated');
        if (rail.integrationStatus === 'api_ready') pros.push('API integration available');
        if (rail.recommended) pros.push('Recommended partner');
        if (timeScore > 80) pros.push('Fast processing');

        if (costPercentage > 2) cons.push('Higher fees');
        if (rail.integrationStatus === 'manual') cons.push('Manual processing required');
        if (timeScore < 50) cons.push('Slower processing time');

        const costBreakdown = rail.pricingModel === 'free' ? 'Free' :
          rail.pricingModel === 'bps' ? 
            `${rail.baseFee}bps = $${totalCost.toFixed(2)}` :
            `${rail.baseFee}bps + $${rail.fixedFee} = $${totalCost.toFixed(2)}`;

        return {
          rail,
          totalCost,
          costBreakdown,
          processingTime: rail.processingTime,
          suitabilityScore,
          pros,
          cons
        };
      })
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    setRecommendations(recs);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Smart Route Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Corridor</label>
              <Select value={corridor} onValueChange={setCorridor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select corridor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-domestic">US Domestic</SelectItem>
                  <SelectItem value="europe-major">Europe Major</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="china">China</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cost">Lowest Cost</SelectItem>
                  <SelectItem value="speed">Fastest Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={generateRecommendations} className="w-full">
            <Calculator className="mr-2 h-4 w-4" />
            Find Best Routes
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Route Recommendations</h3>
          {recommendations.map((rec, index) => (
            <Card key={rec.rail.id} className={index === 0 ? 'border-primary shadow-md' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {index === 0 && <CheckCircle className="h-5 w-5 text-green-600" />}
                      <span className="font-semibold text-lg">{rec.rail.name}</span>
                      {index === 0 && <Badge>Best Match</Badge>}
                    </div>
                    <Badge variant={getScoreBadgeVariant(rec.suitabilityScore)}>
                      Score: {rec.suitabilityScore.toFixed(0)}
                    </Badge>
                  </div>
                  <Button 
                    onClick={() => onSelectRail?.(rec.rail)}
                    variant={index === 0 ? 'default' : 'outline'}
                  >
                    Select This Route
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="font-semibold">${rec.totalCost.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{rec.costBreakdown}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Processing Time</p>
                      <p className="font-semibold">{rec.processingTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Integration</p>
                      <p className="font-semibold capitalize">{rec.rail.integrationStatus.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-2">Advantages</p>
                    <ul className="space-y-1">
                      {rec.pros.map((pro, i) => (
                        <li key={i} className="text-sm flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {rec.cons.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-yellow-600 mb-2">Considerations</p>
                      <ul className="space-y-1">
                        {rec.cons.map((con, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-yellow-500" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
