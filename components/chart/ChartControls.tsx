
import React from 'react';
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { LayersIcon } from '@/components/icons/LayersIcon';
import { CheckIcon } from '@/components/icons/CheckIcon';
import { AreaChartIcon } from '@/components/icons/AreaChartIcon';
import { LineChartIcon } from '@/components/icons/LineChartIcon';
import { CandleChartIcon } from '@/components/icons/CandleChartIcon';

type ChartType = 'Area' | 'Line' | 'Candlestick';
type TimeRange = '30m' | '1h' | '4h' | '1D' | 'All';

const timeRanges: { label: string; value: TimeRange }[] = [
  { label: '30m', value: '30m' }, { label: '1H', value: '1h' }, { label: '4H', value: '4h' },
  { label: '1D', value: '1D' }, { label: 'All', value: 'All' },
];

const chartTypes: { type: ChartType; icon: React.ReactNode }[] = [
  { type: 'Area', icon: <AreaChartIcon className="w-5 h-5" /> },
  { type: 'Line', icon: <LineChartIcon className="w-5 h-5" /> },
  { type: 'Candlestick', icon: <CandleChartIcon className="w-5 h-5" /> },
];

interface ChartControlsProps {
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  showMA20: boolean;
  setShowMA20: (show: boolean) => void;
  showMA200: boolean;
  setShowMA200: (show: boolean) => void;
  showRSI: boolean;
  setShowRSI: (show: boolean) => void;
}

export const ChartControls = ({
  chartType, setChartType, timeRange, setTimeRange,
  showMA20, setShowMA20, showMA200, setShowMA200, showRSI, setShowRSI
}: ChartControlsProps) => {
  return (
    <div className="flex flex-wrap items-center justify-end gap-4">
        <div className="flex items-center gap-1 rounded-lg bg-gray-900 p-1">
            {timeRanges.map(tr => (
                <Tooltip key={tr.value} content={`Set time range to ${tr.label}`}>
                    <button onClick={() => setTimeRange(tr.value)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${timeRange === tr.value ? 'bg-cyan-600 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-700'}`}>
                    {tr.label}
                    </button>
                </Tooltip>
            ))}
        </div>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 p-2 h-auto rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 border-none">
                    <LayersIcon className="w-5 h-5"/>
                    <span>Indicators</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-gray-800 border border-gray-700 text-gray-50">
                <DropdownMenuItem onClick={() => setShowMA20(!showMA20)} className="flex items-center justify-between cursor-pointer hover:bg-gray-700 py-2 px-3">
                    <span>SMA (20)</span>
                    {showMA20 && <CheckIcon className="w-4 h-4 text-cyan-400" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowMA200(!showMA200)} className="flex items-center justify-between cursor-pointer hover:bg-gray-700 py-2 px-3">
                    <span>SMA (200)</span>
                    {showMA200 && <CheckIcon className="w-4 h-4 text-cyan-400" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowRSI(!showRSI)} className="flex items-center justify-between cursor-pointer hover:bg-gray-700 py-2 px-3">
                    <span>RSI (14)</span>
                    {showRSI && <CheckIcon className="w-4 h-4 text-cyan-400" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-1 rounded-lg bg-gray-700 p-1">
            {chartTypes.map(ct => (
                <Tooltip key={ct.type} content={`${ct.type} Chart`}>
                    <button onClick={() => setChartType(ct.type)} title={ct.type} className={`p-2 rounded-md transition-colors ${chartType === ct.type ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'}`}>
                    {ct.icon}
                    </button>
                </Tooltip>
            ))}
        </div>
    </div>
  );
};