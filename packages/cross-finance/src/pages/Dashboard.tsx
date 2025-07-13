import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { USDTRateBar } from '@/components/dashboard/USDTRateBar';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { VolumeBreakdown } from '@/components/dashboard/VolumeBreakdown';
import { TransactionFeed } from '@/components/dashboard/TransactionFeed';

const Dashboard = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-7xl">
        <div className="space-y-8">
          <DashboardHeader 
            title="OneRemit Admin Operations"
            description="Real-time transaction monitoring and system administration"
          />
          
          {/* Critical Operations Above the Fold */}
          <USDTRateBar />
          
          {/* Summary Cards - Side by Side */}
          <SummaryCards />
          
          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Volume Breakdown (Expanded) */}
            <div className="lg:col-span-2">
              <VolumeBreakdown />
            </div>
            
            {/* Right: Compact Transaction Feed */}
            <div>
              <TransactionFeed />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;