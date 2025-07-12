
import { RailsOverview } from '@/components/rails/RailsOverview';
import { StatCard } from '@/components/dashboard/StatCard';
import { RailComparisonCard } from '@/components/dashboard/RailComparisonCard';
import { Banknote, TrendingUp } from 'lucide-react';
import { Rail } from '@/data/railsData';
import { useExchangeRate } from '@/hooks/useExchangeRate';

interface RailsDashboardProps {
  railsData: Rail[];
}

export function RailsDashboard({ railsData }: RailsDashboardProps) {
  const { data: exchangeRateData } = useExchangeRate();
  
  return (
    <>
      <RailsOverview />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Monthly Volume"
          value="$2.4M"
          description="Across all rails"
          trend="up"
          trendValue="12% from last month"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
        
        <StatCard
          title="Top Rail"
          value="Ribh"
          description="4.2% margin"
          trend="up"
          trendValue="0.2% from last week"
        />
        
        <StatCard
          title="Naira Equivalent"
          value={`₦${(2400000 * (exchangeRateData?.rate || 1280.50)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          description="Based on current USDT rate"
          icon={<Banknote className="h-5 w-5 text-primary" />}
        />
      </div>
      
      <RailComparisonCard rails={railsData} className="max-w-3xl" />
    </>
  );
}
