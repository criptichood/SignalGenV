import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { NumberInput } from '@/components/ui/NumberInput';
import { Select } from '@/components/ui/Select';

export const LeverageCalculator = () => {
    const [capital, setCapital] = useState('1000');
    const [entryPrice, setEntryPrice] = useState('');
    const [exitPrice, setExitPrice] = useState('');
    const [leverage, setLeverage] = useState('25');
    const [position, setPosition] = useState<'long' | 'short'>('long');

    const result = useMemo(() => {
        const cap = parseFloat(capital || '0');
        const entry = parseFloat(entryPrice || '0');
        const exit = parseFloat(exitPrice || '0');
        const lev = parseInt(leverage, 10);

        if (!cap || !entry || !exit || !lev || entry === 0) {
            return { pnl: 0, percentage: 0, liquidation: 0 };
        }

        const priceChange = position === 'long' ? (exit - entry) / entry : (entry - exit) / entry;
        const pnl = cap * priceChange * lev;
        const percentage = priceChange * lev * 100;
        // Simplified liquidation formula. Note: Real liquidation includes fees and maintenance margin, which varies.
        const liquidation = position === 'long' ? entry * (1 - 1 / lev) : entry * (1 + 1 / lev);

        return { pnl, percentage, liquidation };
    }, [capital, entryPrice, exitPrice, leverage, position]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold text-xl">⚡</span>
                    Leverage P&L Calculator
                </CardTitle>
                <CardDescription>Calculate potential profit, loss, and liquidation price.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Position</Label>
                        <Select value={position} onValueChange={(v) => setPosition(v as 'long' | 'short')}>
                            <option value="long">Long</option>
                            <option value="short">Short</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="capital">Capital ($)</Label>
                        <NumberInput id="capital" value={capital} onValueChange={setCapital} placeholder="e.g., 1000" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="entry">Entry Price</Label>
                        <NumberInput id="entry" value={entryPrice} onValueChange={setEntryPrice} placeholder="e.g., 50000" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="exit">Exit Price</Label>
                        <NumberInput id="exit" value={exitPrice} onValueChange={setExitPrice} placeholder="e.g., 51000" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="leverage-pnl">Leverage (x)</Label>
                        <NumberInput id="leverage-pnl" value={leverage} onValueChange={setLeverage} placeholder="e.g., 25" />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <div className="w-full space-y-3">
                    <div className="w-full bg-gray-900/70 p-3 rounded-lg shadow-inner">
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                            <span>Profit / Loss</span>
                            <span className={`font-bold ${result.percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {result.percentage.toFixed(2)}%
                            </span>
                        </div>
                        <p className={`text-xl font-bold font-mono truncate ${result.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(result.pnl)}
                        </p>
                    </div>
                    <div className="w-full bg-gray-900/70 p-3 rounded-lg shadow-inner">
                        <p className="text-xs text-gray-400 mb-1">Est. Liquidation Price</p>
                        <p className="text-xl font-bold font-mono text-yellow-400 truncate">
                            ~{formatCurrency(result.liquidation)}
                        </p>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
};