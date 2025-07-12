import React from 'react';

export const ProfitAndLoss: React.FC = () => (
  <>
    <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
      Profit and Loss Summary
    </h2>
    <div className="flex flex-wrap gap-4 px-4 py-6">
      <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-xl border border-[#474747] p-6">
        <p className="text-white text-base font-medium leading-normal">PNL Comparison by Currency</p>
        <p className="text-white tracking-light text-[32px] font-bold leading-tight truncate">$123,456.78</p>
        <div className="flex gap-1">
          <p className="text-[#ababab] text-base font-normal leading-normal">Last 30 Days</p>
          <p className="text-[#0bda0b] text-base font-medium leading-normal">+8.9%</p>
        </div>
        <div className="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3">
          <div className="border-[#ababab] bg-[#303030] border-t-2 w-full" style={{ height: '80%' }} />
          <p className="text-[#ababab] text-[13px] font-bold leading-normal tracking-[0.015em]">USD</p>
          <div className="border-[#ababab] bg-[#303030] border-t-2 w-full" style={{ height: '20%' }} />
          <p className="text-[#ababab] text-[13px] font-bold leading-normal tracking-[0.015em]">EUR</p>
          <div className="border-[#ababab] bg-[#303030] border-t-2 w-full" style={{ height: '0%' }} />
          <p className="text-[#ababab] text-[13px] font-bold leading-normal tracking-[0.015em]">GBP</p>
          <div className="border-[#ababab] bg-[#303030] border-t-2 w-full" style={{ height: '80%' }} />
          <p className="text-[#ababab] text-[13px] font-bold leading-normal tracking-[0.015em]">CAD</p>
        </div>
      </div>
      <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-xl border border-[#474747] p-6">
        <p className="text-white text-base font-medium leading-normal">Average Margin %</p>
        <p className="text-white tracking-light text-[32px] font-bold leading-tight truncate">12.3%</p>
        <div className="flex gap-1">
          <p className="text-[#ababab] text-base font-normal leading-normal">Last 30 Days</p>
          <p className="text-[#0bda0b] text-base font-medium leading-normal">+2.1%</p>
        </div>
        <div className="grid min-h-[180px] gap-x-4 gap-y-6 grid-cols-[auto_1fr] items-center py-3">
          <p className="text-[#ababab] text-[13px] font-bold leading-normal tracking-[0.015em]">USD</p>
          <div className="h-full flex-1">
            <div className="border-[#ababab] bg-[#303030] border-r-2 h-full" style={{ width: '70%' }} />
          </div>
          <p className="text-[#ababab] text-[13px] font-bold leading-normal tracking-[0.015em]">EUR</p>
          <div className="h-full flex-1">
            <div className="border-[#ababab] bg-[#303030] border-r-2 h-full" style={{ width: '80%' }} />
          </div>
          <p className="text-[#ababab] text-[13px] font-bold leading-normal tracking-[0.015em]">GBP</p>
          <div className="h-full flex-1">
            <div className="border-[#ababab] bg-[#303030] border-r-2 h-full" style={{ width: '30%' }} />
          </div>
          <p className="text-[#ababab] text-[13px] font-bold leading-normal tracking-[0.015em]">CAD</p>
          <div className="h-full flex-1">
            <div className="border-[#ababab] bg-[#303030] border-r-2 h-full" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    </div>
  </>
);
