
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Zap, 
  Globe, 
  Clock, 
  TrendingUp, 
  DollarSign,
  Wifi,
  WifiOff,
  Settings,
  Activity
} from 'lucide-react';
import { Rail, Transaction } from '@/data/railsData';

interface BankingPartnerCommandCenterProps {
  rails: Rail[];
  transactions: Transaction[];
}

export function BankingPartnerCommandCenter({ rails, transactions }: BankingPartnerCommandCenterProps) {
  // Calculate metrics
  const activeRails = rails.filter(rail => rail.status === 'online').length;
  const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const todayTransactions = transactions.filter(tx => 
    new Date(tx.date).toDateString() === new Date().toDateString()
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getIntegrationBadge = (status: string) => {
    switch (status) {
      case 'api_integrated': return <Badge className="bg-green-100 text-green-800">API Live</Badge>;
      case 'api_ready': return <Badge className="bg-blue-100 text-blue-800">API Ready</Badge>;
      case 'manual': return <Badge variant="outline">Manual</Badge>;
      default: return null;
    }
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
    <div className="space-y-6">
      {/* Command Center Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Banking Partner Command Center</h1>
            <p className="text-muted-foreground">Real-time monitoring and intelligent routing for your banking partners</p>
          </div>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Configure Partners
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Active Partners</p>
              <p className="text-2xl font-bold text-green-700">{activeRails}/{rails.length}</p>
            </div>
            <Wifi className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Daily Volume</p>
              <p className="text-2xl font-bold text-blue-700">${(totalVolume / 1000).toFixed(0)}K</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Today's Transactions</p>
              <p className="text-2xl font-bold text-purple-700">{todayTransactions}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 mb-1">API Integrations</p>
              <p className="text-2xl font-bold text-amber-700">
                {rails.filter(r => r.integrationStatus !== 'manual').length}
              </p>
            </div>
            <Zap className="h-8 w-8 text-amber-600" />
          </div>
        </Card>
      </div>

      {/* Banking Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rails.map((rail) => (
          <Card key={rail.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(rail.status)}`} />
                  <CardTitle className="text-lg">{rail.name}</CardTitle>
                </div>
                {getIntegrationBadge(rail.integrationStatus)}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {rail.specialization.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Pricing Information */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Pricing</span>
                  <span className="text-lg font-bold text-primary">{formatFee(rail)}</span>
                </div>
                {rail.corridorPricing && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Major: {rail.corridorPricing.major.baseFee}bps + ${rail.corridorPricing.major.fixedFee}</div>
                    <div>China: {rail.corridorPricing.china.baseFee}bps + ${rail.corridorPricing.china.fixedFee}</div>
                  </div>
                )}
              </div>

              {/* Performance Metrics */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing Time</span>
                  <span className="font-medium">{rail.processingTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Max Transaction</span>
                  <span className="font-medium">${rail.maxTransactionCap?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Supported Regions</span>
                  <span className="font-medium">{rail.regions.length}</span>
                </div>
              </div>

              {/* Supported Methods */}
              <div>
                <p className="text-sm font-medium mb-2">Payment Methods</p>
                <div className="flex flex-wrap gap-1">
                  {rail.supportedMethods.map((method, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" className="flex-1">
                  Use This Partner
                </Button>
              </div>
            </CardContent>

            {/* Recommended Badge */}
            {rail.recommended && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-primary text-primary-foreground">
                  Recommended
                </Badge>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
