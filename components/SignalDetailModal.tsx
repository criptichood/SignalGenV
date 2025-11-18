

import React from 'react';
import type { SavedSignal } from '@/types';
import { X } from 'lucide-react';
import { SignalCard } from '@/components/signal/SignalCard';

interface SignalDetailModalProps {
  signal: SavedSignal;
  onClose: () => void;
  setToast: (toast: { message: string; variant: 'success' | 'warning' | 'error' } | null) => void;
}

export const SignalDetailModal = ({ signal, onClose, setToast }: SignalDetailModalProps) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-800/80 backdrop-blur-sm p-3 border-b border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-white ml-3">{signal.symbol} Signal Details</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-4">
             <SignalCard 
                signal={signal}
                isLoading={false}
                viewContext="history"
                isFavorite={false} // Favorites are managed on the main page, not in modal
                setToast={setToast}
             />
        </div>
      </div>
    </div>
  );
};