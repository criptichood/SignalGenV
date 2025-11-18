import React from 'react';
import type { TrackedWallet, StablecoinHolding } from '../../types';
import { Loader2Icon } from '../icons/Loader2Icon';
import { Trash2Icon } from '../icons/Trash2Icon';
import { WalletIcon } from '../icons/WalletIcon';

interface WalletListItemProps {
    wallet: TrackedWallet;
    holdingInfo?: { data: StablecoinHolding[], isLoading: boolean };
    onDelete: () => void;
}

const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

const formatValue = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const CoinIcon = ({ symbol }: { symbol: 'USDC' | 'USDT' | 'DAI' }) => {
    const styles = {
        USDC: { bg: 'bg-[#2775CA]', text: '$', textColor: 'text-white' },
        USDT: { bg: 'bg-[#26A17B]', text: 'T', textColor: 'text-white' },
        DAI: { bg: 'bg-[#F9A602]', text: 'D', textColor: 'text-black' },
    };
    const style = styles[symbol];
    if (!style) return <div className="w-6 h-6 rounded-full bg-gray-600 flex-shrink-0" />;

    return (
        <div className={`w-6 h-6 rounded-full ${style.bg} flex items-center justify-center font-bold text-sm flex-shrink-0 ${style.textColor}`}>
            {style.text}
        </div>
    );
};

export const WalletListItem = ({ wallet, holdingInfo, onDelete }: WalletListItemProps) => {
    const totalValue = holdingInfo?.data.reduce((sum, h) => sum + h.value, 0) ?? 0;

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <WalletIcon className="w-5 h-5 text-cyan-400" />
                        <div>
                            <h4 className="font-bold text-base text-white">{wallet.label}</h4>
                            <p className="text-xs text-gray-400 font-mono">{formatAddress(wallet.address)}</p>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    {holdingInfo?.isLoading ? (
                        <Loader2Icon className="w-5 h-5 text-gray-400 animate-spin" />
                    ) : (
                        <p className="font-mono font-bold text-lg text-white">{formatValue(totalValue)}</p>
                    )}
                </div>
            </div>

            {holdingInfo && !holdingInfo.isLoading && holdingInfo.data.length > 0 && (
                 <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-2">
                    {holdingInfo.data.map(coin => (
                        <div key={coin.symbol} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                                <CoinIcon symbol={coin.symbol} />
                                <span className="text-gray-300 font-semibold">{coin.name}</span>
                            </div>
                            <div className="text-right">
                                <p className="font-mono text-gray-300">{coin.balance.toFixed(4)}</p>
                                <p className="font-mono text-xs text-gray-500">{formatValue(coin.value)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
             <div className="flex justify-end mt-2">
                <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-400 font-semibold flex items-center gap-1">
                    <Trash2Icon className="w-3 h-3"/> Remove
                </button>
            </div>
        </div>
    );
};
