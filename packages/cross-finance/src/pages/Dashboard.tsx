import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FilterButtons } from '@/components/dashboard/FilterButtons';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { VolumeBreakdown } from '@/components/dashboard/VolumeBreakdown';
import { ProfitAndLoss } from '@/components/dashboard/ProfitAndLoss';
import { ExportOptions } from '@/components/dashboard/ExportOptions';

const Dashboard = () => {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#141414] overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <DashboardHeader 
              title="Dashboard"
              description="Overview of your transaction performance and key metrics"
            />
            <FilterButtons />
            <SummaryCards />
            <VolumeBreakdown />
            <ProfitAndLoss />
            <ExportOptions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;