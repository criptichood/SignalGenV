
import React from 'react';
import { ChartIcon } from '@/components/icons/ChartIcon';

interface ChartPlaceholderProps {
  message: string;
}

export const ChartPlaceholder = ({ message }: ChartPlaceholderProps) => {
  return (
    <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-gray-500 p-4">
      <ChartIcon className="w-12 h-12 mb-4" />
      <h3 className="text-lg font-semibold text-gray-400">Not Enough Data</h3>
      <p className="text-sm max-w-xs">{message}</p>
    </div>
  );
};
