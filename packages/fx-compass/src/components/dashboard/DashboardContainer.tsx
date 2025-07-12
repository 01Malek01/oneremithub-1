import React, { useEffect, useState, Suspense } from 'react';
import { PesaRates } from '@/services/currency-rates/api';
import { useDashboardState } from '@/hooks/useDashboardState';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import RateCalculatorSection from '@/components/dashboard/RateCalculatorSection';
import MarketComparisonSection from '@/components/dashboard/MarketComparisonSection';
import { BarChart3, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import RefreshCountdown from '@/components/dashboard/rate-display/RefreshCountdown';
import LiveRateDisplay from '@/components/dashboard/LiveRateDisplay';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AnalyticsChart from '../AnalyticsChart';

// Lazy load only non-critical section for faster initial render
const CostPriceSection = React.lazy(() => import('@/components/dashboard/CostPriceSection'));

// Simple placeholder components for lazy-loaded components
const CostPricePlaceholder = () => <div className="animate-pulse h-64 w-full bg-muted/20 rounded-md"></div>;

// Lazy loaded analytics component


const DashboardContainer = () => {
  const {
    usdtNgnRate,
    costPrices,
    previousCostPrices,
    vertoFxRates,
    lastUpdated,
    isLoading,
    usdMargin,
    otherCurrenciesMargin,
    handleBybitRateRefresh,
    handleMarginUpdate,
    getOneremitRates,
    fxRates,
    nextRefreshIn,
    setVertoFxRates,
    pesaRates,
    isPesaRatesRefreshing,
    pesaRatesLastUpdated,
    pesaRatesError,
    refreshPesaRates: handlePesaRefresh,
    refreshAllRates,
  }: {
    usdtNgnRate: number | null;
    costPrices: any;
    previousCostPrices: any;
    vertoFxRates: any;
    lastUpdated: Date | null;
    isLoading: boolean;
    usdMargin: number;
    otherCurrenciesMargin: number;
    handleBybitRateRefresh: () => void;
    handleMarginUpdate: () => void;
    getOneremitRates: any;
    fxRates: any;
    nextRefreshIn: number;
    setVertoFxRates: (rates: any) => void;
    pesaRates: PesaRates;
    isPesaRatesRefreshing: boolean;
    pesaRatesLastUpdated: Date | null;
    pesaRatesError: string | null;
    refreshPesaRates: () => Promise<void>;
    refreshAllRates: () => Promise<void>;
  } = useDashboardState();

  // State for real-time indicator - keep this active longer for better visual feedback
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);

  // Optimized effect to track changes and show real-time indicator when data changes
  useEffect(() => {
    if (usdtNgnRate) {
      setIsRealtimeActive(true);
      // Keep the real-time indicator active for 3 seconds
      const timer = setTimeout(() => setIsRealtimeActive(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [usdtNgnRate]);

  // Show simple loading state if no rate is available yet
  if (usdtNgnRate === null) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="dashboard-bg absolute inset-0 -z-10"></div>

      <Card className="bg-card/80 backdrop-blur-sm border-border/40 mb-6 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Wifi className={`h-3 w-3 ${isRealtimeActive ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`} />
                    <span>Real-time updates {isRealtimeActive ? 'active' : 'enabled'}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Changes made by other users will appear automatically</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-3">
          <LiveRateDisplay 
            rate={usdtNgnRate}
            lastUpdated={lastUpdated}
            onRefresh={async () => { await refreshAllRates(); return true; }}
            isLoading={isLoading}
            isRealtimeActive={isRealtimeActive}
          />
        </div>
        <div className="lg:col-span-3">
          <RateCalculatorSection
            usdtNgnRate={usdtNgnRate}
            lastUpdated={lastUpdated}
            usdMargin={usdMargin}
            otherCurrenciesMargin={otherCurrenciesMargin}
            onBybitRateRefresh={handleBybitRateRefresh}
            onMarginUpdate={handleMarginUpdate}
            isLoading={isLoading}
          />
        </div>
      </div>

      <Suspense fallback={<CostPricePlaceholder />}>
        <CostPriceSection
          costPrices={costPrices}
          previousCostPrices={previousCostPrices}
          isLoading={isLoading}
        />
      </Suspense>

      <Separator className="my-8 opacity-30" />

      {/* Render the MarketComparisonSection directly without lazy loading */}
      <MarketComparisonSection
        pesaRates={pesaRates}
        isPesaRatesRefreshing={isPesaRatesRefreshing}
        pesaRatesLastUpdated={pesaRatesLastUpdated}
        pesaRatesError={pesaRatesError}
        refreshPesaRates={handlePesaRefresh}
        currencies={['USD', 'EUR', 'GBP', 'CAD']}
        oneremitRatesFn={getOneremitRates}
        vertoFxRates={vertoFxRates}
        isLoading={isLoading}
        setVertoFxRates={setVertoFxRates}
        usingDefaults={vertoFxRates ? 
          ['USD', 'EUR', 'GBP', 'CAD'].some(curr => !vertoFxRates[curr] || 
            (vertoFxRates[curr].buy === 0 && vertoFxRates[curr].sell === 0)) 
          : true}
      />

      <Separator className="my-8 opacity-30" />

      {/* Only render analytics placeholder after core content is loaded */}
      <Suspense fallback={null}>
        <AnalyticsChart />
      </Suspense>

      <RefreshCountdown
        nextRefreshIn={nextRefreshIn}
        isRefreshing={isLoading}
      />
    </div>
  );
};

export default DashboardContainer;
