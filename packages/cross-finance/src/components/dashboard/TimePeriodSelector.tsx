import React from 'react';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

export type TimePeriod = 'daily' | 'weekly' | 'monthly';

interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const periods = [
  { key: 'daily' as TimePeriod, label: 'Daily', icon: <Clock className="w-3 h-3" /> },
  { key: 'weekly' as TimePeriod, label: 'Weekly', icon: <Calendar className="w-3 h-3" /> },
  { key: 'monthly' as TimePeriod, label: 'Monthly', icon: <TrendingUp className="w-3 h-3" /> }
];

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({ 
  selectedPeriod, 
  onPeriodChange 
}) => {
  return (
    <div className="flex gap-1 p-1 bg-white/5 rounded-lg backdrop-blur-sm">
      {periods.map((period) => (
        <button
          key={period.key}
          onClick={() => onPeriodChange(period.key)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
            ${selectedPeriod === period.key 
              ? 'bg-white/15 text-white shadow-sm' 
              : 'text-white/70 hover:text-white hover:bg-white/10'
            }
          `}
        >
          {period.icon}
          {period.label}
        </button>
      ))}
    </div>
  );
};