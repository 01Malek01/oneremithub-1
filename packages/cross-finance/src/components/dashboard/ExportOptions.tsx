import React from 'react';

interface ExportButtonProps {
  label: string;
  onClick?: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({ label, onClick }) => (
  <button 
    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#303030] text-white text-sm font-bold leading-normal tracking-[0.015em]"
    onClick={onClick}
  >
    <span className="truncate">{label}</span>
  </button>
);

export const ExportOptions: React.FC = () => (
  <>
    <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
      Export Options
    </h2>
    <div className="flex justify-stretch">
      <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-start">
        <ExportButton label="Export as CSV" />
        <ExportButton label="Export as Excel" />
      </div>
    </div>
    <div className="flex justify-stretch">
      <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-start">
        <ExportButton label="Download PDF Snapshot" />
        <ExportButton label="Schedule Email Reports" />
      </div>
    </div>
  </>
);
