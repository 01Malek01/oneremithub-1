
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Rail } from '@/data/railsData';

interface RailManagementCardProps {
  rails: Rail[];
  onAddRail: () => void;
  onDeleteRail: (rail: Rail) => void;
  onEditRail: (rail: Rail) => void;
}

export function RailManagementCard({ 
  rails, 
  onAddRail,
  onDeleteRail,
  onEditRail
}: RailManagementCardProps) {
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Banking Partner Management</CardTitle>
          <CardDescription>Manage your banking partners and their configurations</CardDescription>
        </div>
        <Button onClick={onAddRail}>
          <Plus className="mr-1" size={16} />
          Add New Partner
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rails.map((rail) => (
            <div 
              key={rail.id} 
              className="p-4 border rounded-md flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{rail.name}</div>
                {rail.recommended && <Badge variant="outline" className="bg-primary/20">Recommended</Badge>}
              </div>
              
              <div className="text-sm text-muted-foreground">
                <div>Processing: {rail.processingTime}</div>
                <div>Fee: {formatFee(rail)}</div>
                <div>TAT: {rail.expectedTAT}</div>
                {rail.maxTransactionCap && (
                  <div>Max Cap: ${rail.maxTransactionCap.toLocaleString()}</div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {rail.specialization.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEditRail(rail)}
                  className="flex-1"
                >
                  <Edit className="mr-1" size={16} />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDeleteRail(rail)}
                  className="flex-1"
                >
                  <Trash2 className="mr-1" size={16} />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
