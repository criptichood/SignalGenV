

import React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Dialog = ({ isOpen, onClose, children, title, headerActions, footer, maxWidth = 'max-w-lg' }: DialogProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-gray-800 rounded-lg shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-800/80 backdrop-blur-sm p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <div className="flex items-center gap-3">
            {headerActions}
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 -mr-2">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="p-4 border-t border-gray-700 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};