import React from 'react';

interface CompactStatsHeaderProps {
  title: string;
  value: string | number;
  change?: string;
  className?: string;
}

export const CompactStatsHeader: React.FC<CompactStatsHeaderProps> = ({
  title,
  value,
  change,
  className = ''
}) => {
  return (
    <div className={`text-center ${className}`}>
      <h3 className="text-sm text-[#ababab] font-medium">{title}</h3>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {change && (
        <p className="text-sm text-green-400 mt-1">{change}</p>
      )}
    </div>
  );
};