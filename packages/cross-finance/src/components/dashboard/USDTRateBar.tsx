import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, TrendingDown, Wifi, WifiOff, Activity, BarChart3 } from 'lucide-react';
interface USDTNGNRate {
  rate: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
  dayHigh: number;
  dayLow: number;
  volume: number;
  trend: 'up' | 'down' | 'stable';
}
interface ConnectionStatus {
  status: 'connected' | 'connecting' | 'disconnected';
  latency: number;
  lastReconnect: Date | null;
}
export const USDTRateBar: React.FC = () => {
  const [usdtRate, setUsdtRate] = useState<USDTNGNRate>({
    rate: 1650.00,
    change: 5.50,
    changePercent: 0.33,
    lastUpdated: new Date(),
    dayHigh: 1675.50,
    dayLow: 1625.00,
    volume: 2450000,
    trend: 'up'
  });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'connected',
    latency: 45,
    lastReconnect: null
  });
  const [rateHistory, setRateHistory] = useState<number[]>([1650.00]);
  const [trendDirection, setTrendDirection] = useState<number>(1); // 1 for up trend, -1 for down trend

  // Enhanced rate simulation with trends and persistence
  const updateRate = useCallback(() => {
    setUsdtRate(prev => {
      const baseRate = 1650;

      // Trend persistence - 70% chance to continue current trend
      const shouldContinueTrend = Math.random() < 0.7;
      const newTrendDirection = shouldContinueTrend ? trendDirection : trendDirection * -1;
      setTrendDirection(newTrendDirection);

      // More realistic variation based on trend
      const trendInfluence = newTrendDirection * (Math.random() * 15 + 5); // 5-20 NGN in trend direction
      const randomNoise = (Math.random() - 0.5) * 10; // ±5 NGN random noise
      const totalVariation = trendInfluence + randomNoise;
      const newRate = Math.max(1600, Math.min(1700, prev.rate + totalVariation));
      const change = newRate - prev.rate;
      const changePercent = change / prev.rate * 100;

      // Update day high/low
      const dayHigh = Math.max(prev.dayHigh, newRate);
      const dayLow = Math.min(prev.dayLow, newRate);

      // Determine trend
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (Math.abs(changePercent) > 0.1) {
        trend = changePercent > 0 ? 'up' : 'down';
      }

      // Update volume (simulate trading activity)
      const volumeVariation = (Math.random() - 0.5) * 100000;
      const volume = Math.max(1000000, prev.volume + volumeVariation);
      return {
        rate: newRate,
        change: change,
        changePercent: changePercent,
        lastUpdated: new Date(),
        dayHigh,
        dayLow,
        volume,
        trend
      };
    });
  }, [trendDirection]);

  // Connection status simulation
  const updateConnectionStatus = useCallback(() => {
    setConnectionStatus(prev => {
      // 5% chance of connection issues
      if (Math.random() < 0.05 && prev.status === 'connected') {
        return {
          status: 'connecting',
          latency: prev.latency + 50,
          lastReconnect: new Date()
        };
      }

      // If connecting, 80% chance to reconnect
      if (prev.status === 'connecting' && Math.random() < 0.8) {
        return {
          status: 'connected',
          latency: 30 + Math.random() * 40,
          // 30-70ms latency
          lastReconnect: prev.lastReconnect
        };
      }

      // Normal latency variation
      if (prev.status === 'connected') {
        return {
          ...prev,
          latency: Math.max(20, Math.min(100, prev.latency + (Math.random() - 0.5) * 10))
        };
      }
      return prev;
    });
  }, []);

  // Update rate history for sparkline
  const updateRateHistory = useCallback((newRate: number) => {
    setRateHistory(prev => {
      const newHistory = [...prev, newRate];
      return newHistory.slice(-20); // Keep last 20 points
    });
  }, []);
  useEffect(() => {
    const rateInterval = setInterval(() => {
      updateRate();
    }, 3000);
    const connectionInterval = setInterval(() => {
      updateConnectionStatus();
    }, 5000);
    return () => {
      clearInterval(rateInterval);
      clearInterval(connectionInterval);
    };
  }, [updateRate, updateConnectionStatus]);

  // Update history when rate changes
  useEffect(() => {
    updateRateHistory(usdtRate.rate);
  }, [usdtRate.rate, updateRateHistory]);

  // Format numbers with proper locale
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace('NGN', '₦');
  };
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    return `${(volume / 1000).toFixed(0)}K`;
  };
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Create sparkline path for mini chart
  const sparklinePath = useMemo(() => {
    if (rateHistory.length < 2) return '';
    const width = 60;
    const height = 20;
    const min = Math.min(...rateHistory);
    const max = Math.max(...rateHistory);
    const range = max - min || 1;
    const points = rateHistory.map((rate, index) => {
      const x = index / (rateHistory.length - 1) * width;
      const y = height - (rate - min) / range * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  }, [rateHistory]);
  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">USDT/NGN Rate</h3>
          <div className="flex items-center gap-1">
            {connectionStatus.status === 'connected' ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : connectionStatus.status === 'connecting' ? (
              <Activity className="h-3 w-3 text-yellow-500 animate-pulse" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {connectionStatus.latency}ms
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <svg width="60" height="20" className="overflow-visible">
            <path
              d={sparklinePath}
              stroke={usdtRate.trend === 'up' ? '#10b981' : usdtRate.trend === 'down' ? '#ef4444' : '#6b7280'}
              strokeWidth="1.5"
              fill="none"
              className="drop-shadow-sm"
            />
          </svg>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Rate Display */}
        <div className="md:col-span-2">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(usdtRate.rate)}
            </span>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              usdtRate.trend === 'up' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : usdtRate.trend === 'down'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {usdtRate.trend === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : usdtRate.trend === 'down' ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Activity className="h-3 w-3" />
              )}
              {usdtRate.changePercent > 0 ? '+' : ''}{usdtRate.changePercent.toFixed(2)}%
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Change: {formatCurrency(usdtRate.change)} • Last update: {formatTime(usdtRate.lastUpdated)}
          </div>
        </div>

        {/* Market Data */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">24h High:</span>
            <span className="font-medium text-foreground">{formatCurrency(usdtRate.dayHigh)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">24h Low:</span>
            <span className="font-medium text-foreground">{formatCurrency(usdtRate.dayLow)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Volume:</span>
            <span className="font-medium text-foreground">{formatVolume(usdtRate.volume)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};