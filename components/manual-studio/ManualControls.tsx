import React, { useMemo } from 'react';
import type { Signal, Exchange, Timeframe } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { NumberInput } from '@/components/ui/NumberInput';
import { Button } from '@/components/ui/Button';
import { Combobox } from '@/components/ui/Combobox';
import { PencilIcon } from '@/components/icons/PencilIcon';
import { Loader2Icon } from '@/components/icons/Loader2Icon';
import { Textarea } from '../ui/Textarea';

const allTimeframes: { value: Timeframe, label: string }[] = [
    '1m','3m','5m','15m','30m','1h','2h','4h','1d','1w'
].map(tf => ({ value: tf as Timeframe, label: tf.replace('m', ' Min').replace('h', ' Hr').replace('d', ' Day').replace('w', ' Week') }));

interface ManualControlsProps {
    formData: any;
    setFormData: (fn: (prev: any) => any) => void;
    symbols: string[];
    setManualSignal: (signal: Signal | null) => void;
    isStaging: boolean;
    onStageSignal: () => void;
}

const StatDisplay = ({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) => (
    <div className="flex justify-between items-baseline text-sm">
        <span className="text-gray-400">{label}</span>
        <span className={`font-mono font-bold ${color}`}>{value}</span>
    </div>
);

const ManualControls = ({ formData, setFormData, symbols, setManualSignal, isStaging, onStageSignal }: ManualControlsProps) => {
    const [favorites, setFavorites] = useLocalStorage<string[]>('manualSignalFavorites', ['BTCUSDT', 'ETHUSDT']);

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const calculated = useMemo(() => {
        const entry = parseFloat(formData.entry);
        const sl = parseFloat(formData.sl);
        const tp1 = parseFloat(formData.tp1);
        const margin = parseFloat(formData.margin);
        const leverage = parseFloat(formData.leverage);

        if (!entry || !sl || !tp1 || !margin || !leverage) {
            setManualSignal(null);
            return null;
        }

        const positionSizeUSD = margin * leverage;
        const positionSizeCoins = entry > 0 ? positionSizeUSD / entry : 0;
        const stopDistance = Math.abs(entry - sl);
        const riskAmount = stopDistance * positionSizeCoins;
        const riskPercentOfMargin = margin > 0 ? (riskAmount / margin) * 100 : 0;
        
        const rewardDistance = Math.abs(tp1 - entry);
        const rrRatio = stopDistance > 0 ? rewardDistance / stopDistance : 0;
        
        const potentialProfit = rewardDistance * positionSizeCoins;

        const newSignal: Signal = {
            direction: formData.direction,
            entryRange: [entry, entry],
            stopLoss: sl,
            takeProfit: [formData.tp1, formData.tp2, formData.tp3].map(parseFloat).filter(v => !isNaN(v) && v > 0),
            leverage: leverage,
            rrRatio,
            confidence: 0,
            tradeDuration: formData.duration || 'Not Set',
            reasoning: formData.reasoning || 'Enter your reasoning in the panel.',
        };
        setManualSignal(newSignal);

        return { riskAmount, positionSizeCoins, positionSizeUSD, rrRatio, potentialProfit, riskPercentOfMargin };
    }, [formData, setManualSignal]);
    
    const canStage = !!calculated;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><PencilIcon className="w-5 h-5 text-cyan-400"/> Manual Signal Studio</CardTitle>
                <CardDescription>Build your own trade blueprint.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Exchange</Label><Select value={formData.exchange} onValueChange={(v) => handleChange('exchange', v as Exchange)}><option value="binance">Binance</option><option value="bybit">Bybit</option></Select></div>
                    <div className="space-y-2"><Label>Direction</Label><Select value={formData.direction} onValueChange={(v) => handleChange('direction', v as 'LONG' | 'SHORT')}><option value="LONG">Long</option><option value="SHORT">Short</option></Select></div>
                </div>
                <div className="space-y-2"><Label>Symbol</Label><Combobox symbols={symbols} value={formData.symbol} onSelect={(v) => handleChange('symbol', v)} favorites={favorites} setFavorites={setFavorites}/></div>
                <div className="space-y-2"><Label>Timeframe</Label><Select value={formData.timeframe} onValueChange={(v) => handleChange('timeframe', v as Timeframe)}>{allTimeframes.map(tf => <option key={tf.value} value={tf.value}>{tf.label}</option>)}</Select></div>
                
                <div className="space-y-3 pt-3 border-t border-gray-700">
                    <Label className="font-semibold text-gray-300">Trade Levels</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label htmlFor="entry">Entry</Label><NumberInput id="entry" value={formData.entry} onValueChange={v => handleChange('entry', v)} placeholder="65000" /></div>
                        <div className="space-y-1"><Label htmlFor="sl">Stop Loss</Label><NumberInput id="sl" value={formData.sl} onValueChange={v => handleChange('sl', v)} placeholder="64500" /></div>
                    </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label htmlFor="tp1">TP 1</Label><NumberInput id="tp1" value={formData.tp1} onValueChange={v => handleChange('tp1', v)} placeholder="66000" /></div>
                        <div className="space-y-1"><Label htmlFor="tp2">TP 2</Label><NumberInput id="tp2" value={formData.tp2} onValueChange={v => handleChange('tp2', v)} placeholder="Optional" /></div>
                        <div className="space-y-1"><Label htmlFor="tp3">TP 3</Label><NumberInput id="tp3" value={formData.tp3} onValueChange={v => handleChange('tp3', v)} placeholder="Optional" /></div>
                    </div>
                </div>
                
                <div className="space-y-3 pt-3 border-t border-gray-700">
                     <Label className="font-semibold text-gray-300">Risk Management</Label>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label htmlFor="margin">Margin ($)</Label><NumberInput id="margin" value={formData.margin} onValueChange={v => handleChange('margin', v)} /></div>
                        <div className="space-y-1"><Label htmlFor="leverage">Leverage</Label><NumberInput id="leverage" value={formData.leverage} onValueChange={v => handleChange('leverage', v)} /></div>
                    </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-700">
                    <Label className="font-semibold text-gray-300">Trade Context</Label>
                    <div className="space-y-1">
                        <Label htmlFor="duration">Expected Duration</Label>
                        <Select id="duration" value={formData.duration} onValueChange={(value) => handleChange('duration', value)}>
                            <option value="5m - 30m">5m - 30m</option>
                            <option value="30m - 1hr">30m - 1hr</option>
                            <option value="1hr - 2hr">1hr - 2hr</option>
                            <option value="4hr - 6hr">4hr - 6hr</option>
                            <option value="6hr - 12hr">6hr - 12hr</option>
                            <option value="12hr+">12hr+</option>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="reasoning">Your Reasoning</Label>
                        <Textarea id="reasoning" value={formData.reasoning} onChange={(e) => handleChange('reasoning', e.target.value)} placeholder="e.g., 'Price is sweeping liquidity before retesting a key order block...'" />
                    </div>
                </div>

                {calculated && (
                    <div className="space-y-2 pt-3 border-t border-gray-700">
                        <Label className="font-semibold text-gray-300">Calculated Blueprint</Label>
                        <div className="p-3 bg-gray-900/50 rounded-lg space-y-1.5 border border-gray-700/50">
                            <StatDisplay label="Position Size" value={calculated.positionSizeUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} color="text-cyan-400" />
                            <StatDisplay label="Quantity" value={calculated.positionSizeCoins.toFixed(5)} />
                            <StatDisplay label="Risk Amount" value={calculated.riskAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} color="text-yellow-400" />
                            <StatDisplay label="Risk % of Margin" value={`${calculated.riskPercentOfMargin.toFixed(2)}%`} color="text-yellow-400" />
                            <StatDisplay label="R:R (TP1)" value={`1 : ${calculated.rrRatio.toFixed(2)}`} />
                            <StatDisplay label="Profit at TP1" value={calculated.potentialProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} color="text-green-400" />
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={onStageSignal} disabled={!canStage || isStaging} className="w-full">
                    {isStaging ? <><Loader2Icon className="w-4 h-4 mr-2 animate-spin"/>Staging...</> : "Stage Signal & Track"}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ManualControls;