import React from 'react';
import { INDUSTRIES } from '../constants.ts';
import { BriefcaseIcon } from './IconComponents.tsx';

interface IndustrySelectorProps {
  selectedIndustry: string;
  onIndustryChange: (industry: string) => void;
}

export const IndustrySelector: React.FC<IndustrySelectorProps> = ({ selectedIndustry, onIndustryChange }) => {
  return (
    <div className="relative w-full">
      <BriefcaseIcon className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 text-slate-400" />
      <select
        value={selectedIndustry}
        onChange={(e) => onIndustryChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        {INDUSTRIES.map((industry) => (
          <option key={industry} value={industry} className="bg-slate-800 text-white">
            {industry}
          </option>
        ))}
      </select>
    </div>
  );
};