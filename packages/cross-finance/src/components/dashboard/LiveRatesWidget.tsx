import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface Rate {
  currency: string;
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

const mockRates: Rate[] = [
  { currency: 'USDT', pair: 'USDT/USD', rate: 1.0001, change: 0.0001, changePercent: 0.01, lastUpdated: new Date() },
  { currency: 'EUR', pair: 'EUR/USD', rate: 1.0856, change: -0.0023, changePercent: -0.21, lastUpdated: new Date() },
  { currency: 'GBP', pair: 'GBP/USD', rate: 1.2734, change: 0.0145, changePercent: 1.15, lastUpdated: new Date() },
  { currency: 'CAD', pair: 'CAD/USD', rate: 0.7341, change: -0.0034, changePercent: -0.46, lastUpdated: new Date() },
];

export const LiveRatesWidget: React.FC = () => {
  const [rates, setRates] = useState<Rate[]>(mockRates);
  const [isConnected, setIsConnected] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setRates(prev => prev.map(rate => ({
        ...rate,
        rate: rate.rate + (Math.random() - 0.5) * 0.001,
        change: (Math.random() - 0.5) * 0.01,
        changePercent: (Math.random() - 0.5) * 2,
        lastUpdated: new Date()
      })));
      setLastRefresh(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="glass-card relative rounded-2xl p-6 animate-fade-in">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-glow/10 to-primary/5 opacity-50" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white text-lg font-semibold mb-1">Live Exchange Rates</h3>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-emerald-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className="text-white/60 text-sm">
                Last updated: {formatTime(lastRefresh)}
              </span>
            </div>
          </div>
          <button className="glass-button p-2 rounded-xl hover:scale-110 transition-all duration-300">
            <RefreshCw className="w-4 h-4 text-white animate-pulse" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rates.map((rate) => (
            <div 
              key={rate.currency}
              className="glass-button group relative rounded-xl p-4 hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white font-medium text-sm">{rate.pair}</h4>
                    <p className="text-primary text-lg font-bold">
                      {rate.rate.toFixed(4)}
                    </p>
                  </div>
                  <div className={`p-1 rounded-lg ${
                    rate.changePercent >= 0 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {rate.changePercent >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <span className={`${
                    rate.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {rate.changePercent >= 0 ? '+' : ''}{rate.changePercent.toFixed(2)}%
                  </span>
                  <span className="text-white/60">
                    ({rate.change >= 0 ? '+' : ''}{rate.change.toFixed(4)})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary-glow/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">Market Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};