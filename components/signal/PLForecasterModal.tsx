import React, { useState, useMemo } from 'react';
import type { Signal, UserParams } from '@/types';
import { Dialog } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { NumberInput } from '@/components/ui/NumberInput';
import { Button } from '@/components/ui/Button';

interface PLForecasterModalProps {
    isOpen: boolean;
    onClose: () => void;
    signal: Signal & { symbol: string };
    params: UserParams;
}

const formatValue = (value: number, type: 'currency' | 'percent' | 'number', decimals: number = 2) => {
    if (isNaN(value) || !isFinite(value)) return '-';
    if (type === 'currency') {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }
    if (type === 'percent') {
        return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`;
    }
    return value.toFixed(decimals);
};

const ResultRow = ({ label, price, pnl, roe, rr, isLoss = false }: { label: string; price: number; pnl: number; roe: number; rr?: number; isLoss?: boolean; }) => (
    <div className={`grid grid-cols-4 items-center p-2 rounded-md ${isLoss ? 'bg-red-900/30' : 'bg-green-900/30'}`}>
        <span className={`font-semibold text-sm ${isLoss ? 'text-red-400' : 'text-green-400'}`}>{label}</span>
        <span className="font-mono text-center text-gray-300">{formatValue(price, 'currency')}</span>
        <span className={`font-mono text-center font-bold ${isLoss ? 'text-red-400' : 'text-green-400'}`}>{formatValue(pnl, 'currency')}</span>
        <span className={`font-mono text-right font-bold ${isLoss ? 'text-red-400' : 'text-green-400'}`}>{formatValue(roe, 'percent')}</span>
        {rr && <span className="font-mono text-right text-xs text-gray-400 col-start-4">1 : {rr.toFixed(2)} R:R</span>}
    </div>
);


export const PLForecasterModal = ({ isOpen, onClose, signal, params }: PLForecasterModalProps) => {
    const [margin, setMargin] = useState(String(params.margin || '100'));
    const [entryPrice, setEntryPrice] = useState(String((signal.entryRange[0] + signal.entryRange[1]) / 2));
    
    const calculated = useMemo(() => {
        const M = parseFloat(margin);
        const E = parseFloat(entryPrice);
        const L = signal.leverage;
        const SL = signal.stopLoss;

        if (isNaN(M) || isNaN(E) || M <= 0 || E <= 0) return null;

        const isLong = signal.direction === 'LONG';
        const positionSizeUSD = M * L;
        const positionSizeAsset = positionSizeUSD / E;

        const lossUSD = Math.abs(E - SL) * positionSizeAsset;
        const lossPercent = (lossUSD / M) * 100;

        const profitLevels = signal.takeProfit.map((tp, i) => {
            const profitUSD = Math.abs(tp - E) * positionSizeAsset;
            const profitPercent = (profitUSD / M) * 100;
            const rr = lossUSD > 0 ? profitUSD / lossUSD : Infinity;
            return { label: `TP${i+1}`, price: tp, pnl: profitUSD, roe: profitPercent, rr };
        });

        return {
            positionSizeUSD,
            positionSizeAsset,
            loss: { price: SL, pnl: -lossUSD, roe: -lossPercent },
            profits: profitLevels
        };
    }, [margin, entryPrice, signal]);

    const footer = <div className="flex justify-end"><Button onClick={onClose}>Close</Button></div>;
    
    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={`P/L Forecaster: ${signal.direction} ${signal.symbol}`} footer={footer} maxWidth="max-w-2xl">
            <div className="space-y-6">
                {/* Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className="space-y-1">
                        <Label htmlFor="forecast-margin">Margin ($)</Label>
                        <NumberInput id="forecast-margin" value={margin} onValueChange={setMargin} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="forecast-entry">Custom Entry Price</Label>
                        <NumberInput id="forecast-entry" value={entryPrice} onValueChange={setEntryPrice} />
                    </div>
                </div>

                {/* Calculated Blueprint */}
                {calculated && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="p-3 bg-gray-900/50 rounded-lg"><p className="text-xs text-gray-400">Position Size (USD)</p><p className="text-lg font-bold font-mono text-cyan-400">{formatValue(calculated.positionSizeUSD, 'currency')}</p></div>
                            <div className="p-3 bg-gray-900/50 rounded-lg"><p className="text-xs text-gray-400">Quantity ({signal.symbol.replace('USDT', '')})</p><p className="text-lg font-bold font-mono text-white">{formatValue(calculated.positionSizeAsset, 'number', 4)}</p></div>
                            <div className="p-3 bg-gray-900/50 rounded-lg"><p className="text-xs text-gray-400">Leverage</p><p className="text-lg font-bold font-mono text-white">{signal.leverage}x</p></div>
                        </div>

                        {/* Results Table */}
                        <div className="space-y-2">
                             <div className="grid grid-cols-4 items-center px-2 text-xs font-semibold text-gray-500">
                                <span>Target</span>
                                <span className="text-center">Price</span>
                                <span className="text-center">P/L ($)</span>
                                <span className="text-right">ROE (%)</span>
                            </div>
                            <ResultRow label="Stop Loss" price={calculated.loss.price} pnl={calculated.loss.pnl} roe={calculated.loss.roe} isLoss />
                            {calculated.profits.map(tp => (
                                <ResultRow key={tp.label} {...tp} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Dialog>
    );
};