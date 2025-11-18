import React from 'react';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { BotIcon } from '@/components/icons/BotIcon';
import { ZapIcon } from '@/components/icons/ZapIcon';

interface AutoExecutionControlsProps {
  isAutoExecutionEnabled: boolean;
  setIsAutoExecutionEnabled: (enabled: boolean) => void;
  autoExecutionThreshold: number;
  setAutoExecutionThreshold: (threshold: number) => void;
  autoExecutionType: 'market' | 'trailing';
  setAutoExecutionType: (type: 'market' | 'trailing') => void;
  isDisabled?: boolean;
  onToggle?: (checked: boolean) => void;
}

export const AutoExecutionControls = ({
  isAutoExecutionEnabled,
  setIsAutoExecutionEnabled,
  autoExecutionThreshold,
  setAutoExecutionThreshold,
  autoExecutionType,
  setAutoExecutionType,
  isDisabled,
  onToggle,
}: AutoExecutionControlsProps) => {
  const handleToggle = (checked: boolean) => {
    if (onToggle) {
        onToggle(checked);
    } else {
        setIsAutoExecutionEnabled(checked);
    }
  }

  return (
    <div className="space-y-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
      <div className="flex items-center justify-between">
        <Label htmlFor="auto-execution" className="flex items-center gap-2 font-semibold text-gray-300 mb-0">
          <BotIcon className="w-4 h-4 text-cyan-400" />
          Auto Execution
        </Label>
        <Switch id="auto-execution" checked={isAutoExecutionEnabled} onCheckedChange={handleToggle} disabled={isDisabled} />
      </div>
      <p className="text-xs text-gray-500">Automatically execute trades if confidence meets the threshold.</p>
      <div className="pt-2 space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="confidence-threshold" className="text-xs font-semibold text-gray-400 mb-0">Confidence Threshold</Label>
          <span className="text-sm font-mono text-cyan-400">{autoExecutionThreshold}%</span>
        </div>
        <input id="confidence-threshold" type="range" min="75" max="95" step="1" value={autoExecutionThreshold} onChange={(e) => setAutoExecutionThreshold(Number(e.target.value))} disabled={isDisabled || !isAutoExecutionEnabled} />
      </div>
      <div className="pt-2">
        <Label htmlFor="execution-type" className="text-xs font-semibold text-gray-400 mb-2">Execution Type</Label>
        <Select id="execution-type" value={autoExecutionType} onValueChange={(v) => setAutoExecutionType(v as any)} disabled={isDisabled || !isAutoExecutionEnabled}>
          <option value="market">Fast Execute (Market)</option>
          <option value="trailing">Execute with Trailing SL</option>
        </Select>
      </div>
      {isAutoExecutionEnabled && (
        <div className="text-xs text-cyan-400 flex items-center gap-2 pt-1">
          <ZapIcon className="w-3 h-3" />
          <span>Armed. Will execute trades ≥ {autoExecutionThreshold}% confidence.</span>
        </div>
      )}
    </div>
  );
};