import React, { useState, useEffect } from 'react';
import type { Signal } from '@/types';
import { CopyIcon } from '@/components/icons/CopyIcon';
import { CheckIcon } from '@/components/icons/CheckIcon';
import { PencilIcon } from '@/components/icons/PencilIcon';
import { CloseIcon } from '@/components/icons/CloseIcon';
import { NumberInput } from '@/components/ui/NumberInput';
import { Label } from '@/components/ui/Label';
import { ArrowRightIcon } from '@/components/icons/ArrowRightIcon';
import { StopCircleIcon } from '@/components/icons/StopCircleIcon';
import { CheckCircleIcon } from '@/components/icons/CheckCircleIcon';
import { formatPrice } from '@/utils/formatting';

interface SignalCardLevelsProps {
    signal: Signal;
    onUpdateSignal?: (updates: Partial<Signal>) => void;
    isExpired?: boolean;
}

export const SignalCardLevels = ({ signal, onUpdateSignal, isExpired }: SignalCardLevelsProps) => {
    const [isEditingLevels, setIsEditingLevels] = useState(false);
    const [editedEntry, setEditedEntry] = useState(String(signal.entryRange[0]));
    const [editedSl, setEditedSl] = useState(String(signal.stopLoss));
    const [isLevelsCopied, setIsLevelsCopied] = useState(false);
    
    let averageEntryPrice = (signal.entryRange[0] + signal.entryRange[1]) / 2;
    const stopLossDistancePercent = averageEntryPrice > 0 ? (Math.abs(averageEntryPrice - signal.stopLoss) / averageEntryPrice) * 100 : 0;

    useEffect(() => {
        // This effect now ONLY runs when a new signal is generated (timestamp changes).
        // It resets the component's state to match the new signal, preventing live price
        // updates from overwriting user input during editing.
        setEditedEntry(String(signal.entryRange[0]));
        setEditedSl(String(signal.stopLoss));
        setIsEditingLevels(false); // Exit edit mode if a new signal comes in.
    }, [(signal as any).timestamp]); // Use a stable unique ID for the signal.

    const handleCopyLevels = () => {
        const tps = signal.takeProfit.map((tp, i) => `TP${i + 1}: ${formatPrice(tp)}`).join('\n');
        const textToCopy = `**Trade Levels**\nDirection: ${signal.direction}\nEntry: ${formatPrice(signal.entryRange[0])} - ${formatPrice(signal.entryRange[1])}\nSL: ${formatPrice(signal.stopLoss)} (${stopLossDistancePercent.toFixed(2)}%)\n${tps}`;
        navigator.clipboard.writeText(textToCopy);
        setIsLevelsCopied(true);
        setTimeout(() => setIsLevelsCopied(false), 2000);
    };

    const handleSaveChanges = () => {
        if (!onUpdateSignal) return;
        const newEntry = parseFloat(editedEntry);
        const newSl = parseFloat(editedSl);
        if (!isNaN(newEntry) && !isNaN(newSl)) {
            onUpdateSignal({
                entryRange: [newEntry, newEntry],
                stopLoss: newSl,
            });
        }
        setIsEditingLevels(false);
    };

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
                    Trade Levels
                    {onUpdateSignal && !isExpired && (
                        !isEditingLevels ? (
                            <button onClick={() => setIsEditingLevels(true)} className="p-1 rounded-full text-gray-400 hover:text-cyan-400" title="Edit Levels"><PencilIcon className="w-4 h-4" /></button>
                        ) : (
                            <div className="flex items-center gap-1">
                                <button onClick={handleSaveChanges} className="p-1 rounded-full text-green-400 hover:bg-green-500/20" title="Save Changes"><CheckIcon className="w-4 h-4" /></button>
                                <button onClick={() => setIsEditingLevels(false)} className="p-1 rounded-full text-red-400 hover:bg-red-500/20" title="Cancel"><CloseIcon className="w-4 h-4" /></button>
                            </div>
                        )
                    )}
                </h4>
                <button onClick={handleCopyLevels} className="p-1.5 rounded-md text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors" aria-label="Copy trade levels">
                    {isLevelsCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                </button>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-grow content-center">
                {isEditingLevels ? (
                    <>
                        <div className="p-2 bg-gray-800 rounded-lg text-center flex flex-col justify-center min-h-[90px]"><Label htmlFor="edit-entry" className="text-xs text-cyan-300 font-semibold mb-1">Entry Price</Label><NumberInput id="edit-entry" value={editedEntry} onValueChange={setEditedEntry} /></div>
                        <div className="p-2 bg-gray-800 rounded-lg text-center flex flex-col justify-center min-h-[90px]"><Label htmlFor="edit-sl" className="text-xs text-red-400 font-semibold mb-1">Stop Loss</Label><NumberInput id="edit-sl" value={editedSl} onValueChange={setEditedSl} /></div>
                    </>
                ) : (
                    <>
                        <div className="p-3 bg-gray-800 rounded-lg text-center flex flex-col justify-center min-h-[90px]">
                            <p className="text-xs text-cyan-300 font-semibold flex items-center justify-center gap-1.5"><ArrowRightIcon className="w-3 h-3"/> Entry Range</p>
                            <div className="text-xl font-bold font-mono text-white mt-1.5 flex flex-col items-center leading-tight">
                                <span>{formatPrice(signal.entryRange[0])}</span>
                                <span>{`- ${formatPrice(signal.entryRange[1])}`}</span>
                            </div>
                        </div>
                        <div className="p-3 bg-gray-800 rounded-lg text-center flex flex-col justify-center min-h-[90px]">
                            <p className="text-xs text-red-400 font-semibold flex items-center justify-center gap-1.5"><StopCircleIcon className="w-3 h-3"/> Stop Loss</p>
                            <p className="text-xl font-bold font-mono text-red-400 truncate mt-1.5">{formatPrice(signal.stopLoss)}</p>
                            <p className="text-xs font-mono text-gray-400">({stopLossDistancePercent.toFixed(2)}%)</p>
                        </div>
                    </>
                )}
                {signal.takeProfit.map((tp, index) => (
                    <div key={index} className="p-3 bg-gray-800 rounded-lg text-center flex flex-col justify-center min-h-[90px]">
                        <p className="text-xs text-green-400 font-semibold flex items-center justify-center gap-1.5"><CheckCircleIcon className="w-3 h-3"/> Take Profit {index + 1}</p>
                        <p className="text-xl font-bold font-mono text-green-400 truncate mt-1.5">{tp ? formatPrice(tp) : '-'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};