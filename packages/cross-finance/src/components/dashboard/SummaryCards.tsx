import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import { TimePeriodSelector, TimePeriod } from './TimePeriodSelector';
import { getVolumeDataByPeriod, getPeriodLabel } from '@/utils/volumeData';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  gradient: string;
}

const AnimatedNumber: React.FC<{ value: string }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState('0');
  
  useEffect(() => {
    const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = numericValue;
    const duration = 1000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(value.replace(numericValue.toString(), Math.floor(start).toLocaleString()));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span className="animate-count-up">{displayValue}</span>;
};

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, trend, gradient }) => (
  <div className={`glass-card group relative min-w-[200px] flex-1 rounded-2xl p-6 ${gradient} hover:scale-105 transition-all duration-300`}>
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div className="relative z-10 flex items-start justify-between mb-4">
      <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
        {icon}
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
    
    <div className="relative z-10">
      <p className="text-white/80 text-sm font-medium mb-2">{title}</p>
      <p className="text-white text-3xl font-bold tracking-tight">
        <AnimatedNumber value={value} />
      </p>
    </div>
    
    <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
  </div>
);

export const SummaryCards: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('monthly');
  const volumeData = getVolumeDataByPeriod(selectedPeriod);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <div className={`glass-card group relative min-w-[200px] flex-1 rounded-2xl p-6 bg-gradient-to-br from-blue-500/20 to-purple-600/20 hover:scale-105 transition-all duration-300`}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Time Period Selector */}
        <div className="relative z-10 flex items-start justify-between mb-4">
          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <TimePeriodSelector 
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </div>
        
        {/* Trend */}
        <div className="relative z-10 flex items-center gap-1 text-emerald-400 text-sm font-medium mb-4">
          <TrendingUp className="w-3 h-3" />
          {volumeData.trend}
        </div>
        
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium mb-2">
            Total Volume Processed
          </p>
          <p className="text-white text-3xl font-bold tracking-tight">
            <AnimatedNumber value={volumeData.value} />
          </p>
        </div>
        
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
      </div>
      
      {/* Total Transactions with Time Period */}
      <div className={`glass-card group relative min-w-[200px] flex-1 rounded-2xl p-6 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 hover:scale-105 transition-all duration-300`}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Time Period Selector */}
        <div className="relative z-10 flex items-start justify-between mb-4">
          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <TimePeriodSelector 
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </div>
        
        {/* Trend */}
        <div className="relative z-10 flex items-center gap-1 text-emerald-400 text-sm font-medium mb-4">
          <TrendingUp className="w-3 h-3" />
          +8.2%
        </div>
        
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium mb-2">
            Total Number of Transactions
          </p>
          <p className="text-white text-3xl font-bold tracking-tight">
            <AnimatedNumber value={selectedPeriod === 'daily' ? '1,234' : selectedPeriod === 'weekly' ? '8,567' : '34,289'} />
          </p>
        </div>
        
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
      </div>
    </div>
  );
};
