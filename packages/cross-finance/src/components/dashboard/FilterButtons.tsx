import React, { useState } from 'react';
import { ChevronDown, Calendar, DollarSign, CheckCircle } from 'lucide-react';

interface FilterButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, icon, onClick, isActive = false }) => (
  <button 
    className={`glass-button group relative flex h-10 items-center justify-center gap-2 rounded-full px-4 py-2 transition-all duration-300 hover:scale-105 ${
      isActive ? 'bg-primary/20 border-primary/50' : ''
    }`}
    onClick={onClick}
  >
    <div className="flex items-center gap-2 text-white">
      {icon}
      <span className="text-sm font-medium">{label}</span>
      <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
    </div>
    
    {isActive && (
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 animate-pulse-glow" />
    )}
  </button>
);

export const FilterButtons: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filters = [
    { label: 'Date Range', icon: <Calendar className="w-4 h-4" />, key: 'date' },
    { label: 'Currency', icon: <DollarSign className="w-4 h-4" />, key: 'currency' },
    { label: 'Transaction Status', icon: <CheckCircle className="w-4 h-4" />, key: 'status' }
  ];

  return (
    <div className="flex gap-4 p-6 flex-wrap animate-slide-up">
      {filters.map((filter) => (
        <FilterButton 
          key={filter.key}
          label={filter.label} 
          icon={filter.icon}
          isActive={activeFilter === filter.key}
          onClick={() => setActiveFilter(activeFilter === filter.key ? null : filter.key)}
        />
      ))}
    </div>
  );
};
