import React, { useState, useMemo } from 'react';
import type { TradeIdea, Timeframe } from '../../types';
import { useScalpingStore } from '../../store/scalpingStore';
import { Card } from '../ui/Card';
import { Label } from '../ui/Label';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { NumberInput } from '../ui/NumberInput';

interface ManualTradeIdeaFormProps {
    onClose: () => void;
    onAttach: (idea: TradeIdea) => void;
}

const allTimeframes: { value: Timeframe, label: string }[] = [
    { value: '1m', label: '1 Minute' }, { value: '3m', label: '3 Minutes' }, { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' }, { value: '30m', label: '30 Minutes' }, { value: '1h', label: '1 Hour' },
    { value: '2h', label: '2 Hours' }, { value: '4h', label: '4 Hours' }, { value: '1d', label: '1 Day' }, { value: '1w', label: '1 Week' },
];

export const ManualTradeIdeaForm = ({ onClose, onAttach }: ManualTradeIdeaFormProps) => {
    const { formData: scalpFormData } = useScalpingStore(); // Get context from a relevant store
    const [idea, setIdea] = useState<Partial<TradeIdea>>({
        symbol: scalpFormData.symbol || 'BTCUSDT',
        timeframe: scalpFormData.timeframe || '5m',
        direction: 'LONG',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const handleChange = (field: keyof TradeIdea, value: string | number) => {
        setIdea(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };
    
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!idea.symbol) newErrors.symbol = "Symbol is required.";
        if (!idea.timeframe) newErrors.timeframe = "Timeframe is required.";
        if (!idea.entry || idea.entry <= 0) newErrors.entry = "Valid entry price is required.";
        if (!idea.takeProfit || idea.takeProfit <= 0) newErrors.takeProfit = "Valid TP is required.";
        if (!idea.stopLoss || idea.stopLoss <= 0) newErrors.stopLoss = "Valid SL is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onAttach(idea as TradeIdea);
        }
    };

    return (
        <Card className="bg-gray-900 border-gray-700 animate-fade-in-down">
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <h4 className="font-semibold">Attach Your Trade Idea</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label htmlFor="idea-symbol">Symbol</Label><Input id="idea-symbol" value={idea.symbol} onChange={e => handleChange('symbol', e.target.value.toUpperCase())} /></div>
                    <div className="space-y-1"><Label htmlFor="idea-tf">Timeframe</Label><Select id="idea-tf" value={idea.timeframe} onValueChange={v => handleChange('timeframe', v as Timeframe)}>{allTimeframes.map(tf => <option key={tf.value} value={tf.value}>{tf.label}</option>)}</Select></div>
                </div>
                <div className="space-y-1"><Label>Direction</Label><Select value={idea.direction} onValueChange={v => handleChange('direction', v as 'LONG' | 'SHORT')}><option value="LONG">Long</option><option value="SHORT">Short</option></Select></div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label htmlFor="idea-entry">Entry</Label>
                        <NumberInput id="idea-entry" value={idea.entry || ''} onValueChange={v => handleChange('entry', Number(v))} placeholder="65000" />
                        {errors.entry && <p className="text-xs text-red-400 mt-1">{errors.entry}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="idea-tp">Take Profit</Label>
                        <NumberInput id="idea-tp" value={idea.takeProfit || ''} onValueChange={v => handleChange('takeProfit', Number(v))} placeholder="66000" />
                        {errors.takeProfit && <p className="text-xs text-red-400 mt-1">{errors.takeProfit}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="idea-sl">Stop Loss</Label>
                        <NumberInput id="idea-sl" value={idea.stopLoss || ''} onValueChange={v => handleChange('stopLoss', Number(v))} placeholder="64500" />
                        {errors.stopLoss && <p className="text-xs text-red-400 mt-1">{errors.stopLoss}</p>}
                    </div>
                </div>
                 <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 h-9 px-4 text-sm">Cancel</Button>
                    <Button type="submit" className="h-9 px-4 text-sm">Attach Idea</Button>
                </div>
            </form>
        </Card>
    );
};
