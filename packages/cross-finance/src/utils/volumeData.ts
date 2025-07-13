import { TimePeriod } from '@/components/dashboard/TimePeriodSelector';

interface VolumeData {
  value: string;
  trend: string;
  previousValue: number;
  currentValue: number;
}

// Mock data generator for different time periods
export const getVolumeDataByPeriod = (period: TimePeriod): VolumeData => {
  const baseValues = {
    daily: {
      current: 45678.90,
      previous: 42150.30,
    },
    weekly: {
      current: 315432.10,
      previous: 289750.85,
    },
    monthly: {
      current: 1234567.89,
      previous: 1125890.45,
    }
  };

  const { current, previous } = baseValues[period];
  const trendPercentage = ((current - previous) / previous * 100);
  const trend = trendPercentage >= 0 ? `+${trendPercentage.toFixed(1)}%` : `${trendPercentage.toFixed(1)}%`;

  return {
    value: `$${current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    trend,
    previousValue: previous,
    currentValue: current
  };
};

export const getPeriodLabel = (period: TimePeriod): string => {
  const labels = {
    daily: 'Today',
    weekly: 'This Week', 
    monthly: 'This Month'
  };
  return labels[period];
};