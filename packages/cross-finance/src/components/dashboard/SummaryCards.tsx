import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value }) => (
  <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-[#303030]">
    <p className="text-white text-base font-medium leading-normal">{title}</p>
    <p className="text-white tracking-light text-2xl font-bold leading-tight">{value}</p>
  </div>
);

export const SummaryCards: React.FC = () => (
  <div className="flex flex-wrap gap-4 p-4">
    <SummaryCard 
      title="Total Volume Processed" 
      value="$1,234,567.89" 
    />
    <SummaryCard 
      title="Total Number of Transactions" 
      value="12,345" 
    />
  </div>
);
