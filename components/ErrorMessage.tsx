import React from 'react';
import { X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onClose: () => void;
}

export const ErrorMessage = ({ message, onClose }: ErrorMessageProps) => {
  return (
    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative flex items-center justify-between gap-4" role="alert">
      <div>
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{message}</span>
      </div>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-red-800/50 -mr-1 -my-1 flex-shrink-0" aria-label="Close error message">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};