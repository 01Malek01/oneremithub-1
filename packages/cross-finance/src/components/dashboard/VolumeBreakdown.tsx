import React from 'react';

export const VolumeBreakdown: React.FC = () => (
  <>
    <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
      Volume Breakdown by Currency
    </h2>
    <div className="flex flex-wrap gap-4 px-4 py-6">
      <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-xl border border-[#474747] p-6">
        <p className="text-white text-base font-medium leading-normal">Transaction Volume Trend</p>
        <p className="text-white tracking-light text-[32px] font-bold leading-tight truncate">$1,234,567.89</p>
        <div className="flex gap-1">
          <p className="text-[#ababab] text-base font-normal leading-normal">Last 30 Days</p>
          <p className="text-[#0bda0b] text-base font-medium leading-normal">+12.3%</p>
        </div>
        <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4">
          <svg width="100%" height="148" viewBox="-3 0 478 150" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path
              d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z"
              fill="url(#paint0_linear_1131_5935)"
            />
            <path
              d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
              stroke="#ababab"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="paint0_linear_1131_5935" x1="236" y1="1" x2="236" y2="149" gradientUnits="userSpaceOnUse">
                <stop stopColor="#303030" />
                <stop offset="1" stopColor="#303030" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex justify-around">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month) => (
              <p key={month} className="text-[#ababab] text-[13px] font-bold leading-normal tracking-[0.015em]">
                {month}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-xl border border-[#474747] p-6">
        <p className="text-white text-base font-medium leading-normal">Volume Comparison by Currency</p>
        <p className="text-white tracking-light text-[32px] font-bold leading-tight truncate">$1,234,567.89</p>
        <div className="flex gap-1">
          <p className="text-[#ababab] text-base font-normal leading-normal">Last 30 Days</p>
          <p className="text-[#fa3838] text-base font-medium leading-normal">-5.6%</p>
        </div>
        <div className="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3">
          <div className="border-[#ababab] bg-[#303030] border-t-2 w-full" style={{ height: '70%' }} />
          <p className="text-[#ababab] text-[13px] font-bold leading-normal tracking-[0.015em]">USD</p>
          <div className="border-[#ababab] bg-[#303030] border-t-2 w-full" style={{ height: '10%' }} />
          <p className="text-[#ababab] text-[13px] font-bold leading-normal tracking-[0.015em]">EUR</p>
          <div className="border-[#ababab] bg-[#303030] border-t-2 w-full" style={{ height: '30%' }} />
          <p className="text-[#ababab] text-[13px] font-bold leading-normal tracking-[0.015em]">GBP</p>
          <div className="border-[#ababab] bg-[#303030] border-t-2 w-full" style={{ height: '20%' }} />
          <p className="text-[#ababab] text-[13px] font-bold leading-normal tracking-[0.015em]">CAD</p>
        </div>
      </div>
    </div>
  </>
);
