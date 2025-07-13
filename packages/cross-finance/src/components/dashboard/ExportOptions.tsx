import React from 'react';
import { Download, FileSpreadsheet, FileText, Mail, Sparkles } from 'lucide-react';

interface ExportButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

const ExportButton: React.FC<ExportButtonProps> = ({ label, icon, onClick, variant = 'secondary' }) => (
  <button 
    className={`glass-button group relative flex items-center justify-center gap-3 rounded-2xl h-12 px-6 transition-all duration-300 hover:scale-105 ${
      variant === 'primary' 
        ? 'bg-gradient-to-r from-primary/30 to-purple-500/30 border-primary/50' 
        : 'bg-gradient-primary'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center gap-3 text-white">
      <div className="p-1 rounded-lg bg-white/10">
        {icon}
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </div>
    
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </button>
);

export const ExportOptions: React.FC = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center gap-3 px-6">
      <div className="p-2 rounded-xl bg-gradient-primary">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <h2 className="gradient-text text-2xl font-bold">
        Export Options
      </h2>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
      <ExportButton 
        label="Export as CSV" 
        icon={<FileSpreadsheet className="w-4 h-4" />}
        variant="primary"
      />
      <ExportButton 
        label="Export as Excel" 
        icon={<FileSpreadsheet className="w-4 h-4" />}
        variant="primary"
      />
      <ExportButton 
        label="Download PDF Snapshot" 
        icon={<FileText className="w-4 h-4" />}
      />
      <ExportButton 
        label="Schedule Email Reports" 
        icon={<Mail className="w-4 h-4" />}
      />
    </div>
  </div>
);
