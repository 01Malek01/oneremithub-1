import React from 'react';

interface DashboardHeaderProps {
  title: string;
  description: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, description }) => (
  <div className="flex flex-wrap justify-between gap-3 p-4">
    <div className="flex min-w-72 flex-col gap-3">
      <p className="text-white tracking-light text-[32px] font-bold leading-tight">{title}</p>
      <p className="text-[#ababab] text-sm font-normal leading-normal">{description}</p>
    </div>
  </div>
);
