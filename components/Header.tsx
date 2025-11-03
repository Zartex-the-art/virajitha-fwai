
import React from 'react';
import { ZapIcon } from './IconComponents';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/60 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <ZapIcon className="w-8 h-8 text-sky-400 mr-3" />
          <h1 className="text-2xl font-bold text-white tracking-tight">
            AI Post Creator
          </h1>
        </div>
      </div>
    </header>
  );
};
