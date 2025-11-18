import React from 'react';
import type { AutopilotState, AutopilotSettings, AutopilotSessionStats, AutopilotScanMode } from '@/types';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { NumberInput } from '@/components/ui/NumberInput';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { PlayCircleIcon } from '@/components/icons/PlayCircleIcon';
import { StopCircleIcon } from '@/components/icons/StopCircleIcon';
import { SlidersHorizontalIcon } from '@/components/icons/SlidersHorizontalIcon';
import { Loader2Icon } from '@/components/icons/Loader2Icon';

interface AutopilotControlsProps {
  autopilotState: AutopilotState;
  onToggleAutopilot: () => void;
  autopilotSettings: AutopilotSettings;
  onAutopilotSettingsChange: (settings: AutopilotSettings) => void;
  autopilotSessionStats: AutopilotSessionStats;
  autopilotScanMode: AutopilotScanMode;
  setAutopilotScanMode: (mode: AutopilotScanMode) => void;
  isDisabled?: boolean;
  isToggleDisabled?: boolean;
}

const formatPnl = (pnl: number, initialCapital: number) => {
    const percentage = initialCapital > 0 ? (pnl / initialCapital) * 100 : 0;
    return `${pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} (${percentage.toFixed(2)}%)`;
};

export const AutopilotControls = ({
  autopilotState,
  onToggleAutopilot,
  autopilotSettings,
  onAutopilotSettingsChange,
  autopilotSessionStats,
  autopilotScanMode,
  setAutopilotScanMode,
  isDisabled,
  isToggleDisabled,
}: AutopilotControlsProps) => {
  const isAutopilotActive = autopilotState !== 'inactive' && autopilotState !== 'stopped';

  const handleSettingsChange = (field: keyof AutopilotSettings, value: any) => {
    onAutopilotSettingsChange({ ...autopilotSettings, [field]: value });
  };

  return (
    <div className={`space-y-3 p-4 bg-gray-900/50 rounded-lg border ${isAutopilotActive ? 'border-cyan-500' : 'border-gray-700/50'}`}>
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 font-semibold text-gray-300 mb-0">
          <PlayCircleIcon className="w-4 h-4 text-cyan-400" />
          Autopilot Mode
        </Label>
        <Button onClick={onToggleAutopilot} disabled={isToggleDisabled} className={`h-8 px-4 text-sm ${isAutopilotActive ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500 disabled:bg-gray-600'}`}>
          {isAutopilotActive ? <><StopCircleIcon className="w-4 h-4 mr-2" />Stop</> : <><PlayCircleIcon className="w-4 h-4 mr-2" />Start</>}
        </Button>
      </div>
      {isAutopilotActive ? (
        <div className="pt-2 space-y-3 text-sm">
          <div className="flex justify-between p-2 bg-gray-800 rounded-md">
            <span className="font-semibold text-gray-400">Status</span>
            <span className="font-mono text-cyan-300 flex items-center gap-2">
              {autopilotState === 'searching' && <Loader2Icon className="w-3 h-3 animate-spin" />}
              {autopilotSessionStats.statusMessage}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-gray-800 rounded-md">
              <div className="text-xs text-gray-500">Session P/L</div>
              <div className={`font-mono font-bold ${autopilotSessionStats.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPnl(autopilotSessionStats.pnl, autopilotSessionStats.initialCapital)}
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded-md">
              <div className="text-xs text-gray-500">Trades</div>
              <div className="font-mono font-bold">{autopilotSessionStats.tradesExecuted} / {autopilotSettings.maxTrades}</div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">Fully automate trade finding and execution based on your settings.</p>
      )}
      <Accordion trigger={<div className="flex items-center gap-2"><SlidersHorizontalIcon className="w-4 h-4" /><span>Autopilot Settings</span></div>}>
        <div className="pt-4 space-y-4">
          <div className="space-y-2"><Label>Scan Mode</Label><Select value={autopilotScanMode} onValueChange={v => setAutopilotScanMode(v as AutopilotScanMode)} disabled={isDisabled}><option value="current">Current Symbol Only</option><option value="favorites-top-5">Scan Top 5 Favorites</option></Select></div>
          <div className="space-y-2"><Label>Session Capital ($)</Label><NumberInput value={autopilotSettings.sessionCapital} onValueChange={v => handleSettingsChange('sessionCapital', Number(v))} disabled={isDisabled} /></div>
          <div className="space-y-2"><Label>Trade Size Mode</Label><Select value={autopilotSettings.tradeSizeMode} onValueChange={v => handleSettingsChange('tradeSizeMode', v)} disabled={isDisabled}><option value="fixed">Fixed Amount ($)</option><option value="percentage">Percentage of Capital (%)</option></Select></div>
          <div className="space-y-2"><Label>Trade Size Value</Label><NumberInput value={autopilotSettings.tradeSizeValue} onValueChange={v => handleSettingsChange('tradeSizeValue', Number(v))} disabled={isDisabled} /></div>
          <div className="space-y-2"><Label>Cooldown Between Trades (minutes)</Label><NumberInput value={autopilotSettings.cooldownMinutes} onValueChange={v => handleSettingsChange('cooldownMinutes', Number(v))} disabled={isDisabled} /></div>
          <div className="space-y-2"><Label>Max Session Drawdown (%)</Label><NumberInput value={autopilotSettings.maxSessionDrawdown} onValueChange={v => handleSettingsChange('maxSessionDrawdown', Number(v))} disabled={isDisabled} /></div>
          <div className="space-y-2"><Label>Stop After X Trades</Label><NumberInput value={autopilotSettings.maxTrades} onValueChange={v => handleSettingsChange('maxTrades', Number(v))} disabled={isDisabled} /></div>
        </div>
      </Accordion>
    </div>
  );
};