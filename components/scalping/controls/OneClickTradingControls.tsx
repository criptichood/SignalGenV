import React from 'react';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { ZapIcon } from '@/components/icons/ZapIcon';

interface OneClickTradingControlsProps {
    isOneClickTradingEnabled: boolean;
    setIsOneClickTradingEnabled: (enabled: boolean) => void;
    isDisabled?: boolean;
}

export const OneClickTradingControls = ({
    isOneClickTradingEnabled,
    setIsOneClickTradingEnabled,
    isDisabled
}: OneClickTradingControlsProps) => {
    return (
        <div className="space-y-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
            <div className="flex items-center justify-between">
                <Label htmlFor="one-click-trading" className="flex items-center gap-2 font-semibold text-gray-300 mb-0">
                    <ZapIcon className="w-4 h-4 text-cyan-400" />
                    One-Click Chart Trading
                </Label>
                <Switch id="one-click-trading" checked={isOneClickTradingEnabled} onCheckedChange={setIsOneClickTradingEnabled} disabled={isDisabled} />
            </div>
            <p className="text-xs text-gray-500">Enable instant Buy/Sell buttons on the chart. Use with caution.</p>
        </div>
    );
};