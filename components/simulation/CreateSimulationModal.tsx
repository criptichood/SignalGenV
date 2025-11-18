import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { SimulationSetup, Exchange } from '@/types';
import { Dialog } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { NumberInput } from '@/components/ui/NumberInput';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Combobox } from '@/components/ui/Combobox';
import { Input } from '@/components/ui/Input';
import { PlayIcon } from '@/components/icons/PlayIcon';
import { SaveIcon } from '@/components/icons/SaveIcon';

interface CreateSimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
    symbols: string[];
    onSave: (setup: SimulationSetup, startImmediately: boolean) => void;
    exchange: Exchange;
    setExchange: (exchange: Exchange) => void;
}

export const CreateSimulationModal = ({ isOpen, onClose, symbols, onSave, exchange, setExchange }: CreateSimulationModalProps) => {
    const [formData, setFormData] = useState({
        symbol: 'BTCUSDT',
        direction: 'LONG',
        entry: '',
        tp1: '',
        tp2: '',
        sl: '',
        leverage: '20',
        customLeverage: '100',
        mode: 'replay',
        timestamp: new Date().toISOString().slice(0, 16),
        endTime: new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16),
    });

    const [error, setError] = useState('');
    const [favorites, setFavorites] = useLocalStorage<string[]>('simulationFavoriteSymbols', ['BTCUSDT', 'ETHUSDT']);

    const stopLossInfo = useMemo(() => {
        const entry = parseFloat(formData.entry);
        const stop = parseFloat(formData.sl);
        if (!entry || !stop || entry <= 0) return { distancePercent: 0 };
        const distancePercent = (Math.abs(entry - stop) / entry) * 100;
        return { distancePercent };
    }, [formData.entry, formData.sl]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
        if (error) setError('');
    };

    const getPriceStep = () => {
        const price = parseFloat(formData.entry);
        if (isNaN(price) || price <= 0) return 0.01;
        if (price < 0.1) return 0.00001;
        if (price < 1) return 0.0001;
        if (price < 10) return 0.001;
        if (price < 1000) return 0.01;
        if (price < 5000) return 0.1;
        return 1;
    }

    const handleNumericChange = (field: 'entry' | 'tp1' | 'tp2' | 'sl' | 'customLeverage', delta: number) => {
        const currentValue = parseFloat((formData as any)[field]) || 0;
        let step = 1;
        if (['entry', 'tp1', 'tp2', 'sl'].includes(field)) step = getPriceStep();
        else if (field === 'customLeverage') step = 5;
        const newValue = currentValue + (delta * step);
        const precision = step.toString().split('.')[1]?.length || 0;
        const finalValue = newValue < 0 ? 0 : newValue;
        handleChange(field, finalValue.toFixed(precision));
    };

    const handleSetStopLossByPercent = (percent: number) => {
        const entry = parseFloat(formData.entry);
        if (!entry || entry <= 0) {
            setError('Please set an entry price first.');
            return;
        }
        let newStopLoss: number;
        if (formData.direction === 'LONG') newStopLoss = entry * (1 - percent / 100);
        else newStopLoss = entry * (1 + percent / 100);
        const step = getPriceStep();
        const precision = step.toString().split('.')[1]?.length || 0;
        handleChange('sl', newStopLoss.toFixed(Math.max(2, precision)));
    };
    
    const handleSubmit = (startImmediately: boolean) => {
        setError('');
        const entry = parseFloat(formData.entry);
        const sl = parseFloat(formData.sl);
        const tp1 = parseFloat(formData.tp1);
        const customLeverageVal = parseInt(formData.customLeverage, 10);
        const startTime = new Date(formData.timestamp).getTime();
        const endTime = new Date(formData.endTime).getTime();
        if (endTime <= startTime) {
            setError('End time must be after the start time.');
            return;
        }
        if (formData.leverage === 'custom' && (!customLeverageVal || customLeverageVal <= 0)) {
            setError('Custom leverage must be a positive number.');
            return;
        }
        if (!formData.symbol || !entry || !sl || !tp1) {
            setError('Symbol, Entry, TP1, and Stop Loss are required.');
            return;
        }
        const leverageValue = formData.leverage === 'custom' ? customLeverageVal : parseInt(formData.leverage, 10);
        const newSetup: SimulationSetup = {
            id: `manual-${crypto.randomUUID()}`, exchange: exchange, symbol: formData.symbol, direction: formData.direction as 'LONG' | 'SHORT',
            entryRange: [entry, entry], takeProfit: [formData.tp1, formData.tp2].map(parseFloat).filter(v => !isNaN(v)),
            stopLoss: sl, leverage: leverageValue, timestamp: startTime, endTime: endTime,
            mode: formData.mode as 'replay' | 'live', status: 'pending',
        };
        onSave(newSetup, startImmediately);
    };

    const footer = (
      <div className="w-full flex gap-3">
          <Button type="button" onClick={() => handleSubmit(false)} className="flex-1 bg-transparent hover:bg-gray-700 border border-gray-600 text-white font-semibold">
              <SaveIcon className="w-5 h-5 mr-2" /> Save
          </Button>
          <Button type="button" onClick={() => handleSubmit(true)} className="flex-1">
              <PlayIcon className="w-5 h-5 mr-2" /> Save & Start
          </Button>
      </div>
    );

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Create New Simulation" footer={footer} maxWidth="max-w-2xl">
             <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="exchange-sim">Exchange</Label>
                    <Select id="exchange-sim" value={exchange} onValueChange={(v) => setExchange(v as Exchange)}>
                        <option value="binance">Binance</option>
                        <option value="bybit">Bybit</option>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Symbol</Label>
                    <Combobox symbols={symbols} value={formData.symbol} onSelect={(val) => handleChange('symbol', val)} favorites={favorites} setFavorites={setFavorites}/>
                </div>
                <div className="space-y-2">
                    <Label>Direction</Label>
                    <Select value={formData.direction} onValueChange={(val) => handleChange('direction', val)}>
                        <option value="LONG">Long</option>
                        <option value="SHORT">Short</option>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="entry">Entry Price</Label>
                    <NumberInput id="entry" step="any" value={formData.entry} onValueChange={(val) => handleChange('entry', val)} onIncrement={() => handleNumericChange('entry', 1)} onDecrement={() => handleNumericChange('entry', -1)} required placeholder="e.g., 65000.50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="tp1">Take Profit 1</Label><NumberInput id="tp1" step="any" value={formData.tp1} onValueChange={(val) => handleChange('tp1', val)} onIncrement={() => handleNumericChange('tp1', 1)} onDecrement={() => handleNumericChange('tp1', -1)} required placeholder="Required" /></div>
                    <div className="space-y-2"><Label htmlFor="tp2">Take Profit 2</Label><NumberInput id="tp2" step="any" value={formData.tp2} onValueChange={(val) => handleChange('tp2', val)} onIncrement={() => handleNumericChange('tp2', 1)} onDecrement={() => handleNumericChange('tp2', -1)} placeholder="Optional" /></div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sl">Stop Loss Price</Label>
                    <NumberInput id="sl" step="any" value={formData.sl} onValueChange={(val) => handleChange('sl', val)} onIncrement={() => handleNumericChange('sl', 1)} onDecrement={() => handleNumericChange('sl', -1)} required />
                        <div className="flex justify-between items-center text-xs px-1 pt-1">
                        <span className="text-gray-400">Distance: <span className="font-mono text-yellow-400">{stopLossInfo.distancePercent.toFixed(2)}%</span></span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                        <button type="button" onClick={() => handleSetStopLossByPercent(0.1)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-md transition-colors">0.1%</button>
                        <button type="button" onClick={() => handleSetStopLossByPercent(0.2)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-md transition-colors">0.2%</button>
                        <button type="button" onClick={() => handleSetStopLossByPercent(0.3)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-md transition-colors">0.3%</button>
                        <button type="button" onClick={() => handleSetStopLossByPercent(0.4)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-md transition-colors">0.4%</button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="leverage">Leverage</Label>
                    <Select id="leverage" value={formData.leverage} onValueChange={(val) => handleChange('leverage', val)}><option value="10">10x</option><option value="20">20x</option><option value="50">50x</option><option value="custom">Custom</option></Select>
                </div>
                {formData.leverage === 'custom' && (<div className="space-y-2 pl-2 border-l-2 border-gray-700"><Label htmlFor="custom-leverage">Custom Leverage</Label><NumberInput id="custom-leverage" value={formData.customLeverage} onValueChange={(val) => handleChange('customLeverage', val)} onIncrement={() => handleNumericChange('customLeverage', 1)} onDecrement={() => handleNumericChange('customLeverage', -1)} placeholder="e.g., 100" /></div>)}
                <div className="space-y-2">
                    <Label>Simulation Mode</Label>
                    <Select value={formData.mode} onValueChange={(val) => handleChange('mode', val)}><option value="replay">Replay Simulation</option><option value="live">Live Simulation</option></Select>
                </div>
                <div className="space-y-2"><Label htmlFor="timestamp">Start Timestamp</Label><Input id="timestamp" type="datetime-local" value={formData.timestamp} onChange={(e) => handleChange('timestamp', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="endTime">End Timestamp</Label><Input id="endTime" type="datetime-local" value={formData.endTime} onChange={(e) => handleChange('endTime', e.target.value)} /></div>
                {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
        </Dialog>
    );
};