import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { NumberInput } from '@/components/ui/NumberInput';
import { BarChartBig } from 'lucide-react';

export const PositionSizeCalculator = () => {
    const [accountSize, setAccountSize] = useState('10000');
    const [riskPercentage, setRiskPercentage] = useState('1');
    const [entryPrice, setEntryPrice] = useState('');
    const [stopLossPrice, setStopLossPrice] = useState('');

    const result = useMemo(() => {
        const account = parseFloat(accountSize);
        const risk = parseFloat(riskPercentage) / 100;
        const entry = parseFloat(entryPrice);
        const stop = parseFloat(stopLossPrice);

        if (!account || !risk || !entry || !stop || entry === stop || risk <= 0 || account <= 0) {
            return { positionValue: 0, riskAmount: 0, shares: 0 };
        }

        const riskAmount = account * risk;
        const riskPerUnit = Math.abs(entry - stop);
        const shares = riskPerUnit > 0 ? riskAmount / riskPerUnit : 0;
        const positionValue = shares * entry;

        return { positionValue, riskAmount, shares };
    }, [accountSize, riskPercentage, entryPrice, stopLossPrice]);
    
    const formatCurrency = (value: number) => {
        if (isNaN(value) || !isFinite(value)) return '$0.00';
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };
    
    const formatShares = (value: number) => {
        if (isNaN(value) || !isFinite(value) || value === 0) return '0';
        return value < 1 ? value.toFixed(8) : value.toFixed(4);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChartBig className="w-5 h-5 text-cyan-400" />
                    Position Size Calculator
                </CardTitle>
                <CardDescription>Determine your position size based on risk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="acc-size">Account Size ($)</Label>
                    <NumberInput id="acc-size" value={accountSize} onValueChange={setAccountSize} placeholder="e.g., 10000" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="risk-perc">Risk per Trade (%)</Label>
                    <NumberInput id="risk-perc" value={riskPercentage} onValueChange={setRiskPercentage} placeholder="e.g., 1" step={0.1}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="entry-price-pos">Entry Price</Label>
                    <NumberInput id="entry-price-pos" value={entryPrice} onValueChange={setEntryPrice} placeholder="e.g., 65000" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sl-price-pos">Stop Loss Price</Label>
                    <NumberInput id="sl-price-pos" value={stopLossPrice} onValueChange={setStopLossPrice} placeholder="e.g., 64500" />
                </div>
            </CardContent>
            <CardFooter>
                <div className="w-full space-y-3">
                    <div className="w-full bg-gray-900/70 p-3 rounded-lg shadow-inner">
                        <p className="text-xs text-gray-400 mb-1">Risk Amount</p>
                        <p className="text-xl font-bold font-mono text-yellow-400 truncate">
                            {formatCurrency(result.riskAmount)}
                        </p>
                    </div>
                    <div className="w-full bg-gray-900/70 p-3 rounded-lg shadow-inner">
                        <p className="text-xs text-gray-400 mb-1">Position Value</p>
                        <p className="text-xl font-bold font-mono text-cyan-400 truncate">
                            {formatCurrency(result.positionValue)}
                        </p>
                    </div>
                     <div className="w-full bg-gray-900/70 p-3 rounded-lg shadow-inner">
                        <p className="text-xs text-gray-400 mb-1">Quantity / Shares</p>
                        <p className="text-xl font-bold font-mono text-white truncate">
                            {formatShares(result.shares)}
                        </p>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
};