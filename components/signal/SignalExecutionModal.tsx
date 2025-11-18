import React, { useState, useEffect, useMemo } from 'react';
import type { Signal, UserParams } from '@/types';
import { BybitTradeDetails } from '@/services/executionService';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { NumberInput } from '@/components/ui/NumberInput';
import { formatPrice } from '@/utils/formatting';

interface SignalExecutionModalProps {
    signal: Signal & { symbol: string };
    currentParams: UserParams;
    executionType: 'market' | 'trailing';
    onConfirm: (tradeDetails: BybitTradeDetails) => void;
    onCancel: () => void;
    setToast: (toast: { message: string; variant: 'success' | 'warning' | 'error' } | null) => void;
}

export const SignalExecutionModal = ({ signal, currentParams, executionType, onConfirm, onCancel, setToast }: SignalExecutionModalProps) => {
    const [modalEntryPrice, setModalEntryPrice] = useState('');
    const [modalStopLoss, setModalStopLoss] = useState('');

    useEffect(() => {
        const avgEntry = (signal.entryRange[0] + signal.entryRange[1]) / 2;
        setModalEntryPrice(String(avgEntry));
        setModalStopLoss(String(signal.stopLoss));
    }, [signal, executionType]);

    const isLong = signal.direction === 'LONG';
    const riskAmount = (currentParams.margin ?? 0) * ((currentParams.risk ?? 0) / 100);
    
    const { modalPositionSize, modalQuantity, modalTrailingStop } = useMemo(() => {
        const modalEntry = parseFloat(modalEntryPrice) || 0;
        const modalSl = parseFloat(modalStopLoss) || 0;
        const modalPositionSize = (currentParams.margin ?? 0) * signal.leverage;
        const modalQuantity = modalEntry > 0 ? modalPositionSize / modalEntry : 0;
        const modalTrailingStop = modalEntry > 0 ? Math.abs(modalEntry - modalSl) : 0;
        return { modalPositionSize, modalQuantity, modalTrailingStop };
    }, [modalEntryPrice, modalStopLoss, currentParams.margin, signal.leverage]);

    const handleConfirm = () => {
        const entryPrice = parseFloat(modalEntryPrice);
        const stopLossPrice = parseFloat(modalStopLoss);

        if (isNaN(entryPrice) || isNaN(stopLossPrice)) {
            setToast({ message: "Invalid entry or stop loss price.", variant: 'error' });
            return;
        }

        const { direction, takeProfit, leverage } = signal;
        const quantity = (modalPositionSize / entryPrice).toFixed(3);

        const tradeDetails: BybitTradeDetails = {
            symbol: signal.symbol,
            side: direction === 'LONG' ? 'Buy' : 'Sell',
            orderType: executionType === 'market' ? 'Market' : 'Limit',
            qty: String(quantity),
            takeProfit: String(takeProfit[0]),
            stopLoss: String(stopLossPrice),
        };
        
        if (executionType !== 'market') {
            tradeDetails.price = String(entryPrice);
        }
        
        if (executionType === 'trailing') {
          const priceStr = entryPrice.toString();
          const decimalPlaces = priceStr.includes('.') ? priceStr.split('.')[1].length : 0;
          tradeDetails.trailingStop = modalTrailingStop.toFixed(decimalPlaces);
        }

        onConfirm(tradeDetails);
    };

    return (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-lg text-center p-4 space-y-4">
            <h3 className="text-2xl font-bold text-white">Confirm Trade Execution</h3>
            <div className="bg-gray-800 p-4 rounded-lg w-full max-w-sm border border-gray-700 space-y-3 text-left text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Action</span><span className={`font-bold ${isLong ? 'text-green-400' : 'text-red-400'}`}>{signal.direction} {signal.symbol}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Order Type</span><span className="font-mono text-white">{executionType === 'market' ? 'Market' : 'Limit'}</span></div>
                {executionType !== 'market' ? (
                    <div className="space-y-1"><Label htmlFor="modal-entry-price" className="text-xs text-gray-400">Entry Price</Label><NumberInput id="modal-entry-price" value={modalEntryPrice} onValueChange={setModalEntryPrice} placeholder="Entry Price" /></div>
                ) : (
                    <div className="flex justify-between"><span className="text-gray-400">Entry Price</span><span className="font-mono text-cyan-400">Market</span></div>
                )}
                <div className="flex justify-between"><span className="text-gray-400">Position Size</span><span className="font-mono text-cyan-400">{formatPrice(modalPositionSize)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Est. Quantity</span><span className="font-mono text-white">{modalQuantity.toFixed(4)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Risk Amount</span><span className="font-mono text-yellow-400">{formatPrice(riskAmount)}</span></div>
                <div className="border-t border-gray-700 my-2"></div>
                <div className="flex justify-between"><span className="text-gray-400">Take Profit (TP1)</span><span className="font-mono text-green-400">{formatPrice(signal.takeProfit[0])}</span></div>
                <div className="space-y-1"><Label htmlFor="modal-stop-loss" className="text-xs text-gray-400">Stop Loss</Label><NumberInput id="modal-stop-loss" value={modalStopLoss} onValueChange={setModalStopLoss} placeholder="Stop Loss" /></div>
                {executionType === 'trailing' && (<div className="flex justify-between"><span className="text-gray-400">Trailing Stop</span><span className="font-mono text-cyan-400">{formatPrice(modalTrailingStop)}</span></div>)}
            </div>
            <div className="flex gap-4 w-full max-w-sm">
                <Button onClick={onCancel} className="w-full bg-gray-600 hover:bg-gray-500">Cancel</Button>
                <Button onClick={handleConfirm} className="w-full">Confirm & Place Trade</Button>
            </div>
        </div>
    );
};