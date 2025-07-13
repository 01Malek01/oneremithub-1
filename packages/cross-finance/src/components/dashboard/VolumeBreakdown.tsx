import React, { useState } from 'react';
import { TrendingUp, BarChart3, MousePointer } from 'lucide-react';
import { TimePeriodSelector, TimePeriod } from './TimePeriodSelector';

export const VolumeBreakdown: React.FC = () => {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: string; date: string } | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('weekly');
  
  // Dynamic currency data based on selected period
  const getCurrencyData = (period: TimePeriod) => {
    const baseData = {
      daily: [
        { currency: 'USD', height: 75, volume: 156789.50, color: 'from-blue-500 to-blue-600' },
        { currency: 'EUR', height: 50, volume: 89234.25, color: 'from-emerald-500 to-emerald-600' },
        { currency: 'GBP', height: 60, volume: 134567.80, color: 'from-purple-500 to-purple-600' },
        { currency: 'CAD', height: 40, volume: 75678.90, color: 'from-amber-500 to-amber-600' }
      ],
      weekly: [
        { currency: 'USD', height: 70, volume: 856789.50, color: 'from-blue-500 to-blue-600' },
        { currency: 'EUR', height: 45, volume: 489234.25, color: 'from-emerald-500 to-emerald-600' },
        { currency: 'GBP', height: 55, volume: 634567.80, color: 'from-purple-500 to-purple-600' },
        { currency: 'CAD', height: 35, volume: 445678.90, color: 'from-amber-500 to-amber-600' }
      ],
      monthly: [
        { currency: 'USD', height: 80, volume: 3456789.50, color: 'from-blue-500 to-blue-600' },
        { currency: 'EUR', height: 55, volume: 1889234.25, color: 'from-emerald-500 to-emerald-600' },
        { currency: 'GBP', height: 65, volume: 2234567.80, color: 'from-purple-500 to-purple-600' },
        { currency: 'CAD', height: 45, volume: 1445678.90, color: 'from-amber-500 to-amber-600' }
      ]
    };
    return baseData[period];
  };

  const currencyData = getCurrencyData(selectedPeriod);
  
  // Calculate total volume and trend for current period
  const getTotalData = (period: TimePeriod) => {
    const data = getCurrencyData(period);
    const total = data.reduce((sum, item) => sum + item.volume, 0);
    const trends = {
      daily: { total, trend: '+8.4%', isPositive: true },
      weekly: { total, trend: '+12.3%', isPositive: true },
      monthly: { total, trend: '-5.6%', isPositive: false }
    };
    return trends[period];
  };

  const totalData = getTotalData(selectedPeriod);
  
  const getPeriodLabel = (period: TimePeriod) => {
    const labels = {
      daily: 'Today',
      weekly: 'This Week',
      monthly: 'This Month'
    };
    return labels[period];
  };

  const chartPoints = [
    { x: 0, y: 109, value: '$890,234', date: 'Jan 1' },
    { x: 36.3077, y: 21, value: '$1,234,567', date: 'Jan 5' },
    { x: 72.6154, y: 41, value: '$1,123,456', date: 'Jan 10' },
    { x: 108.923, y: 93, value: '$934,567', date: 'Jan 15' },
    { x: 145.231, y: 33, value: '$1,198,765', date: 'Jan 20' },
    { x: 181.538, y: 101, value: '$887,654', date: 'Jan 25' },
    { x: 217.846, y: 61, value: '$1,087,432', date: 'Jan 30' },
    { x: 254.154, y: 45, value: '$1,156,789', date: 'Feb 4' },
    { x: 290.462, y: 121, value: '$823,456', date: 'Feb 9' },
    { x: 326.769, y: 149, value: '$765,432', date: 'Feb 14' },
    { x: 363.077, y: 1, value: '$1,456,789', date: 'Feb 19' },
    { x: 399.385, y: 81, value: '$987,654', date: 'Feb 24' },
    { x: 435.692, y: 129, value: '$834,567', date: 'Feb 28' },
    { x: 472, y: 25, value: '$1,298,765', date: 'Mar 5' }
  ];

  const handleChartMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 472;
    
    const closestPoint = chartPoints.reduce((prev, curr) => 
      Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev
    );

    if (Math.abs(closestPoint.x - x) < 30) {
      setHoveredPoint({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        value: closestPoint.value,
        date: closestPoint.date
      });
    } else {
      setHoveredPoint(null);
    }
  };

  const handleChartMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header Section */}
      <div className="px-6">
        <h2 className="text-foreground text-3xl font-bold leading-tight tracking-tight mb-2">
          Volume Breakdown
        </h2>
        <p className="text-muted-foreground text-sm">
          Real-time transaction volume analytics across supported currencies
        </p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 px-6">
        {/* Enhanced Volume Trend Chart */}
        <div className="group">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground text-lg font-semibold">Transaction Volume Trend</h3>
                  <p className="text-muted-foreground text-xs">Last 30 days performance</p>
                </div>
              </div>
              
              {/* Value Display */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-foreground text-3xl font-bold tracking-tight">$1,234,567.89</span>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500 text-xs font-medium">+12.3%</span>
                </div>
              </div>
              
              {/* Interactive SVG Chart */}
              <div className="relative">
                <svg 
                  width="100%" 
                  height="180" 
                  viewBox="-3 0 478 180" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg" 
                  preserveAspectRatio="none" 
                  className="rounded-lg cursor-crosshair"
                  onMouseMove={handleChartMouseMove}
                  onMouseLeave={handleChartMouseLeave}
                >
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/> 
                      </feMerge>
                    </filter>
                  </defs>
                  
                  <path
                    d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V180H0V109Z"
                    fill="url(#areaGradient)"
                  />
                  
                  <path
                    d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    filter="url(#glow)"
                  />

                  {/* Interactive data points */}
                  {chartPoints.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="3"
                      fill="hsl(var(--primary))"
                      className="opacity-0 hover:opacity-100 transition-opacity duration-200"
                      stroke="hsl(var(--background))"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
                
                {/* Interactive tooltip */}
                {hoveredPoint && (
                  <div 
                    className="absolute bg-popover border border-border text-popover-foreground text-xs px-3 py-2 rounded-md pointer-events-none z-20 animate-fade-in shadow-md"
                    style={{ 
                      left: hoveredPoint.x - 40, 
                      top: hoveredPoint.y - 50 
                    }}
                  >
                    <div className="font-semibold">{hoveredPoint.value}</div>
                    <div className="text-muted-foreground">{hoveredPoint.date}</div>
                  </div>
                )}
                
                {/* X-axis labels */}
                <div className="flex justify-around mt-4 pt-2 border-t border-border">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month) => (
                    <span key={month} className="text-muted-foreground text-xs font-medium">
                      {month}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Currency Breakdown */}
        <div className="group">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              {/* Card Header with Time Selector */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <MousePointer className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-lg font-semibold">Volume by Currency</h3>
                    <p className="text-muted-foreground text-xs">Supported currencies breakdown</p>
                  </div>
                </div>
                <TimePeriodSelector 
                  selectedPeriod={selectedPeriod}
                  onPeriodChange={setSelectedPeriod}
                />
              </div>
              
              {/* Value Display */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-foreground text-3xl font-bold tracking-tight">
                  ${totalData.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  totalData.isPositive ? 'bg-emerald-500/10' : 'bg-destructive/10'
                }`}>
                  <TrendingUp className={`w-3 h-3 ${
                    totalData.isPositive ? 'text-emerald-500' : 'text-destructive rotate-180'
                  }`} />
                  <span className={`text-xs font-medium ${
                    totalData.isPositive ? 'text-emerald-500' : 'text-destructive'
                  }`}>
                    {totalData.trend}
                  </span>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm mb-6">{getPeriodLabel(selectedPeriod)}</p>
              
              {/* Currency Bars */}
              <div className="h-[180px] flex items-end justify-center gap-6 px-2">
                {currencyData.map((item) => (
                  <div 
                    key={item.currency}
                    className="flex flex-col items-center gap-3 flex-1 cursor-pointer group/bar"
                    onMouseEnter={() => setHoveredBar(item.currency)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Currency Bar */}
                    <div 
                      className={`w-full max-w-12 rounded-lg bg-gradient-to-t ${item.color} transition-all duration-300 relative overflow-hidden group-hover/bar:scale-105 group-hover/bar:shadow-lg`}
                      style={{ height: `${item.height}%`, minHeight: '24px' }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/bar:translate-x-full transition-transform duration-700" />
                      
                      {/* Enhanced tooltip */}
                      {hoveredBar === item.currency && (
                        <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-popover border border-border text-popover-foreground text-xs px-3 py-2 rounded-md animate-fade-in z-20 shadow-md min-w-max">
                          <div className="font-semibold text-center">{item.currency}</div>
                          <div className="text-emerald-500 font-medium text-center">
                            ${item.volume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-muted-foreground text-[10px] text-center">{getPeriodLabel(selectedPeriod)} Volume</div>
                          <div className="text-muted-foreground text-[10px] text-center">
                            {((item.volume / totalData.total) * 100).toFixed(1)}% of total
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Currency Label */}
                    <span className={`text-sm font-semibold transition-colors duration-200 ${
                      hoveredBar === item.currency ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {item.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
