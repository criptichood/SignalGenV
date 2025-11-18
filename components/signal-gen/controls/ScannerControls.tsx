import React from 'react';
import type { Timeframe } from '@/types';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { ScanLineIcon } from '@/components/icons/ScanLineIcon';
import { Loader2Icon } from '@/components/icons/Loader2Icon';

interface ScannerControlsProps {
  isScannerEnabled: boolean;
  setIsScannerEnabled: (enabled: boolean) => void;
  isScanningSymbol: string | null;
  scannerTimeframe: Timeframe;
  setScannerTimeframe: (timeframe: Timeframe) => void;
  isDisabled?: boolean;
}

const scannerTimeframes: Timeframe[] = ['1h', '4h', '1d'];

export const ScannerControls = ({
  isScannerEnabled,
  setIsScannerEnabled,
  isScanningSymbol,
  scannerTimeframe,
  setScannerTimeframe,
  isDisabled,
}: ScannerControlsProps) => {
  return (
    <div className="space-y-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
      <div className="flex items-center justify-between">
        <Label htmlFor="market-scanner" className="flex items-center gap-2 font-semibold text-gray-300 mb-0">
          <ScanLineIcon className="w-4 h-4 text-cyan-400" />
          Market Scanner
        </Label>
        <Switch id="market-scanner" checked={isScannerEnabled} onCheckedChange={setIsScannerEnabled} disabled={isDisabled} />
      </div>
      <p className="text-xs text-gray-500">Automatically scans favorite pairs for high-confidence setups.</p>
      <div className="pt-2">
        <Label className="text-xs font-semibold text-gray-400 mb-2">Scanner Timeframe</Label>
        <div className="grid grid-cols-3 gap-2">
          {scannerTimeframes.map(tf => (
            <button key={tf} type="button" onClick={() => setScannerTimeframe(tf)} disabled={isDisabled} className={`py-1.5 rounded-md text-xs font-semibold transition-colors ${scannerTimeframe === tf ? 'bg-cyan-500 text-white shadow' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} disabled:opacity-50`}>
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {isScannerEnabled && (
        <div className="text-xs text-cyan-400 flex items-center gap-2 pt-1">
          <Loader2Icon className="w-3 h-3 animate-spin" />
          <span>{isScanningSymbol ? `Scanning ${isScanningSymbol}...` : 'Initializing...'}</span>
        </div>
      )}
    </div>
  );
};