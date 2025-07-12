
import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, BadgeDollarSign } from 'lucide-react';
import { Rail } from '@/data/railsData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Currency = 'USD' | 'GBP' | 'EUR';

interface RailComparisonToolProps {
  rails: Rail[];
  onSelectRail: (rail: Rail) => void;
}

export function RailComparisonTool({ rails, onSelectRail }: RailComparisonToolProps) {
  const [transactionAmount, setTransactionAmount] = useState<number>(100000);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [selectedRailId, setSelectedRailId] = useState<string | null>(null);

  // Calculate costs and sort rails by cost (lowest first)
  const sortedRails = useMemo(() => {
    const railsWithCosts = rails.map(rail => {
      let cost = 0;
      if (rail.pricingModel === 'free') {
        cost = 0;
      } else if (rail.pricingModel === 'bps') {
        cost = (rail.baseFee / 10000) * transactionAmount;
      } else if (rail.pricingModel === 'bps_plus_fixed') {
        cost = (rail.baseFee / 10000) * transactionAmount + (rail.fixedFee || 0);
      }
      return { ...rail, cost };
    });
    
    return railsWithCosts.sort((a, b) => a.cost - b.cost);
  }, [rails, transactionAmount]);

  // Handle select rail
  const handleSelectRail = (rail: Rail) => {
    setSelectedRailId(rail.id);
    onSelectRail(rail);
    toast.success(`${rail.name} banking partner selected for this transaction`);
  };

  // Get cost color class based on ranking
  const getCostColorClass = (cost: number, isSelected: boolean, index: number): string => {
    if (isSelected) return 'bg-primary/10 border-primary';
    
    if (index === 0 && cost === 0) return 'border-green-500 bg-green-50 dark:bg-green-900/10'; // Free
    if (index === 0) return 'border-green-500 bg-green-50 dark:bg-green-900/10'; // Cheapest
    if (index === 1) return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'; // Second cheapest
    return 'border-red-500 bg-red-50 dark:bg-red-900/10'; // Most expensive
  };

  const formatFee = (rail: Rail) => {
    if (rail.pricingModel === 'free') return 'Free';
    if (rail.pricingModel === 'bps') return `${rail.baseFee}bps`;
    if (rail.pricingModel === 'bps_plus_fixed') {
      return `${rail.baseFee}bps + $${rail.fixedFee}`;
    }
    return 'Custom';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BadgeDollarSign className="mr-2 h-6 w-6 text-primary" />
          <span>Banking Partner Cost Comparison</span>
        </CardTitle>
        <CardDescription>
          Compare costs across banking partners to select the most cost-effective option
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Transaction Amount
            </label>
            <Input
              id="amount"
              type="number"
              value={transactionAmount}
              onChange={(e) => setTransactionAmount(Number(e.target.value))}
              className="text-lg"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="currency" className="text-sm font-medium">
              Currency
            </label>
            <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
              <SelectTrigger id="currency" className="text-lg">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Banking Partner</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Max Cap</TableHead>
                <TableHead>Expected TAT</TableHead>
                <TableHead>Pricing Model</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Total Cost
                    <ArrowUp className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRails.map((rail, index) => {
                const isSelected = selectedRailId === rail.id;
                const isOverCap = rail.maxTransactionCap && transactionAmount > rail.maxTransactionCap;
                
                return (
                  <TableRow 
                    key={rail.id} 
                    className={cn(
                      getCostColorClass(rail.cost, isSelected, index),
                      "transition-all"
                    )}
                  >
                    <TableCell className="font-medium">
                      {rail.name}
                      {rail.recommended && (
                        <Badge variant="outline" className="ml-2 bg-primary/20">
                          Recommended
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {rail.specialization.slice(0, 2).map((spec, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rail.maxTransactionCap ? 
                        `${currency} ${rail.maxTransactionCap.toLocaleString()}` : 
                        'No limit'
                      }
                    </TableCell>
                    <TableCell>{rail.expectedTAT}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatFee(rail)}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-lg">
                        {rail.cost === 0 ? 'FREE' : 
                          `${currency} ${rail.cost.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        }
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSelectRail(rail)}
                        disabled={isOverCap}
                        title={isOverCap ? "Transaction amount exceeds partner capacity" : ""}
                      >
                        {isSelected ? "Selected" : "Select Partner"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>* Banking partners are sorted by total cost (lowest to highest).</p>
          <p>* Green indicates best cost, yellow is moderate, red is most expensive.</p>
          <p>* FREE partners are highlighted in green regardless of other costs.</p>
        </div>
      </CardContent>
    </Card>
  );
}
