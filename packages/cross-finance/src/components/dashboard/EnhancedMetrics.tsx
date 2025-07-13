import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Target, Zap, Globe } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  gradient: string;
  subtitle?: string;
  target?: number;
}

const AnimatedCounter: React.FC<{ value: string; duration?: number }> = ({ value, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState('0');
  
  useEffect(() => {
    const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = numericValue;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        const formatted = value.replace(numericValue.toString(), Math.floor(start).toLocaleString());
        setDisplayValue(formatted);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  gradient, 
  subtitle,
  target 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`glass-card group relative rounded-2xl p-6 ${gradient} hover:scale-105 transition-all duration-500 cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background overlay */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent transition-opacity duration-500 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-white/20 rounded-full transition-all duration-1000 ${
              isHovered ? 'animate-float' : ''
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 200}ms`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
            {icon}
          </div>
          <div className="flex items-center gap-1">
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm font-medium ${
              change >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div>
          <p className="text-white/80 text-sm font-medium mb-2">{title}</p>
          <p className="text-white text-2xl font-bold tracking-tight mb-1">
            <AnimatedCounter value={value} />
          </p>
          {subtitle && (
            <p className="text-white/60 text-xs">{subtitle}</p>
          )}
        </div>

        {target && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>Progress to target</span>
              <span>{target}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(target, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Glow effect */}
      <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
    </div>
  );
};

export const EnhancedMetrics: React.FC = () => {
  const metrics = [
    {
      title: 'Daily Volume',
      value: '$2.1M',
      change: 8.7,
      icon: <Activity className="w-6 h-6 text-white" />,
      gradient: 'bg-gradient-to-br from-primary/20 to-primary-glow/20',
      subtitle: 'Processed today',
      target: 75
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 animate-fade-in">
      {metrics.map((metric, index) => (
        <div key={metric.title} style={{ animationDelay: `${index * 100}ms` }}>
          <MetricCard {...metric} />
        </div>
      ))}
    </div>
  );
};