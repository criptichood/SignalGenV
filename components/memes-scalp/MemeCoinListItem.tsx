import React from 'react';
import type { MemeCoin } from '@/types';
import { formatDistanceToNow } from '@/utils/date';

interface MemeCoinListItemProps {
    coin: MemeCoin;
    isSelected: boolean;
    onSelect: () => void;
}

const formatCompactNumber = (num: number) => {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toString();
};

export const MemeCoinListItem = ({ coin, isSelected, onSelect }: MemeCoinListItemProps) => {
    const priceChangeColor = coin.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400';

    return (
        <button
            onClick={onSelect}
            className={`w-full text-left p-3 rounded-lg transition-colors duration-150 ${
                isSelected ? 'bg-cyan-500/20 border border-cyan-500' : 'bg-gray-700/60 border border-transparent hover:bg-gray-700'
            }`}
        >
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-bold text-white text-lg">{coin.symbol}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[150px]">{coin.name}</p>
                </div>
                <div className="text-right">
                    <p className="font-mono text-white">${coin.price.toPrecision(4)}</p>
                    <p className={`font-mono text-sm font-semibold ${priceChangeColor}`}>{coin.priceChange24h.toFixed(2)}%</p>
                </div>
            </div>
            <div className="mt-3">
                <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-purple-300">Hype Score</span>
                    <span className="font-mono text-purple-300">{coin.hypeScore} / 100</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-1.5">
                    <div
                        className="bg-gradient-to-r from-purple-500 to-cyan-400 h-1.5 rounded-full"
                        style={{ width: `${coin.hypeScore}%` }}
                    />
                </div>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                <span>MCap: ${formatCompactNumber(coin.marketCap)}</span>
                <span>Launched: {formatDistanceToNow(coin.launchDate)}</span>
            </div>
        </button>
    );
};