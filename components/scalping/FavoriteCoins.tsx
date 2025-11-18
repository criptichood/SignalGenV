import React from 'react';
import { Star, Zap } from 'lucide-react';

interface FavoriteCoinsProps {
  favorites: string[];
  onSelect: (symbol: string) => void;
  onGenerate: (symbol: string) => void;
  onMouseEnterZap: (symbol: string) => void;
  onMouseLeaveZap: () => void;
  disabled?: boolean;
}

export const FavoriteCoins = ({ favorites, onSelect, onGenerate, onMouseEnterZap, onMouseLeaveZap, disabled }: FavoriteCoinsProps) => {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="grid grid-cols-2 gap-3">
        {favorites.length > 0 ? (
          favorites.map(symbol => (
            <div key={symbol} className="flex items-center gap-0.5">
                <button
                  onClick={() => onSelect(symbol)}
                  disabled={disabled}
                  className="flex-grow px-3 py-2 text-sm font-semibold text-gray-200 bg-gray-700 rounded-l-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:z-10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors truncate"
                  title={symbol}
                >
                  {symbol}
                </button>
                <button
                  onClick={() => onGenerate(symbol)}
                  onMouseEnter={() => onMouseEnterZap(symbol)}
                  onMouseLeave={onMouseLeaveZap}
                  disabled={disabled}
                  className="p-2 bg-gray-700 text-cyan-400 hover:text-white hover:bg-cyan-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:z-10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label={`Generate signal for ${symbol}`}
                >
                  <Zap className="w-5 h-5"/>
                </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 col-span-full text-center py-8">
            No favorite scalping pairs.
          </p>
        )}
      </div>
    </div>
  );
};