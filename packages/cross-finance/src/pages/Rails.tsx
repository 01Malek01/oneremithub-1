import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

const Rails = () => {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#141414] overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <DashboardHeader 
              title="Rails"
              description="Payment rails and routing configuration"
            />
            <div className="text-white p-8">
              <p>Rails page content coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rails;