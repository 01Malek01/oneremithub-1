import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { fetchAllUsdtNgnRates, UsdtNgnRate } from '@/services/usdt-ngn-service';
import { format, subDays, isAfter } from 'date-fns';
import { Moon, Sun } from 'lucide-react';

const TIMEFRAMES = {
  ALL: 'All',
  WEEK: '1W',
  MONTH: '1M',
  THREE_MONTHS: '3M',
  YEAR: '1Y',
  FIVE_YEARS: '5Y'
} as const;

type Timeframe = keyof typeof TIMEFRAMES;

// Helper function: Downsample large datasets
const downsample = <T,>(data: T[], maxPoints: number): T[] => {
  if (data.length <= maxPoints) return data;
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
};

export default function AnalyticsChart() {
  const [rates, setRates] = useState<Array<UsdtNgnRate & { formattedDate: string; date: Date }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('ALL');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Fetch rate data
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setIsLoading(true);
        const ratesData = await fetchAllUsdtNgnRates();

        const processedRates = ratesData
          .filter((rate): rate is UsdtNgnRate & { created_at: string } =>
            Boolean(rate?.rate && rate?.created_at)
          )
          .map(rate => {
            const date = new Date(rate.created_at);
            return {
              ...rate,
              date,
              formattedDate: format(date, 'MMM dd, yyyy')
            };
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        setRates(processedRates);
      } catch (err) {
        console.error('Error fetching rates:', err);
        setError('Failed to load rate data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Filter data by timeframe
  const filterRatesByTimeframe = () => {
    if (timeframe === 'ALL') return rates;

    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'WEEK':
        startDate = subDays(now, 7);
        break;
      case 'MONTH':
        startDate = subDays(now, 30);
        break;
      case 'THREE_MONTHS':
        startDate = subDays(now, 90);
        break;
      case 'YEAR':
        startDate = subDays(now, 365);
        break;
      case 'FIVE_YEARS':
        startDate = subDays(now, 365 * 5);
        break;
      default:
        return rates;
    }

    return rates.filter(rate => isAfter(rate.date, startDate));
  };

  // Final data (filtered + downsampled)
  const MAX_POINTS = 300;
  const filteredRates = downsample(filterRatesByTimeframe(), MAX_POINTS);

  // UI rendering
  if (isLoading) return <div className="text-center py-8">Loading rate data...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (rates.length === 0) return <div className="text-center py-8">No rate data available</div>;

  return (
    <div className="w-full h-[500px] p-4 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">USDT/NGN Rate History</h2>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Timeframe selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(TIMEFRAMES).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTimeframe(key as Timeframe)}
            className={`px-3 py-1 text-sm rounded border ${
              timeframe === key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredRates}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.2} />
            <XAxis
              dataKey="formattedDate"
              tick={{ fontSize: 12, fill: isDarkMode ? '#9ca3af' : '#4b5563' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={value => `₦${value}`}
              tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                color: isDarkMode ? '#f3f4f6' : '#111827'
              }}
              formatter={value => [`₦${value}`, 'USDT/NGN Rate']}
              labelFormatter={label => `Date: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="rate"
              name="USDT/NGN Rate"
              stroke="#60a5fa"
              strokeWidth={2}
              activeDot={{ r: 8 }}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
