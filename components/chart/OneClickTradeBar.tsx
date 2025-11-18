
import React from 'react';
import { Button } from '@/components/ui/Button';
import { NumberInput } from '@/components/ui/NumberInput';
import { Label } from '@/components/ui/Label';

interface OneClickTradeBarProps {
    margin: number;
    onMarginChange: (value: number) => void;
    onTrade: (direction: 'Buy' | 'Sell') => void;
    isSubmitting: boolean;
}

export const OneClickTradeBar = ({ margin, onMarginChange, onTrade, isSubmitting }: OneClickTradeBarProps) => {
    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-2 rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-700 animate-fade-in-down">
            <div className="flex items-center gap-2">
                <Label htmlFor="one-click-margin" className="text-xs font-semibold text-gray-400 whitespace-nowrap">Margin ($)</Label>
                <NumberInput 
                    id="one-click-margin"
                    value={margin}
                    onValueChange={(val) => onMarginChange(Number(val))}
                    className="w-24 h-9"
                    disabled={isSubmitting}
                />
            </div>
            <Button
                onClick={() => onTrade('Buy')}
                disabled={isSubmitting}
                className="h-9 px-6 bg-green-600 hover:bg-green-500 text-white font-bold"
            >
                Buy
            </Button>
            <Button
                onClick={() => onTrade('Sell')}
                disabled={isSubmitting}
                className="h-9 px-6 bg-red-600 hover:bg-red-500 text-white font-bold"
            >
                Sell
            </Button>
        </div>
    );
};
