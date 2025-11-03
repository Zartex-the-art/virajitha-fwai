
import React from 'react';

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center my-12">
      <div className="w-12 h-12 border-4 border-t-sky-500 border-slate-700 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-400">{message}</p>
    </div>
  );
};
