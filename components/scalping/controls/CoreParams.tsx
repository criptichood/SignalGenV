import React from 'react';
import type { Timeframe, UserParams, Exchange } from '@/types';
import { AI_MODELS } from '@/constants';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Combobox } from '@/components/ui/Combobox';
import { ModelCombobox } from '@/components/ui/ModelCombobox';
import { TIMEFRAME_DESCRIPTIONS } from '@/utils/timeframeDescriptions';

interface CoreParamsProps {
  formData: Partial<UserParams>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<UserParams>>>;
  errors: Record<string, string>;
  symbols: string[];
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  isDisabled?: boolean;
}

const scalpingTimeframes: { value: Timeframe, label: string }[] = [
    { value: '1m', label: '1 Minute' }, 
    { value: '3m', label: '3 Minutes' },
    { value: '5m', label: '5 Minutes' }, 
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' }, 
];

export const CoreParams = ({ formData, setFormData, errors, symbols, favorites, setFavorites, isDisabled }: CoreParamsProps) => {
  const handleChange = (field: keyof UserParams, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const selectedModel = AI_MODELS.find(m => m.id === formData.model);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="exchange">Exchange</Label>
        <Select id="exchange" value={formData.exchange} onValueChange={(value) => handleChange('exchange', value as Exchange)} disabled={isDisabled}>
          <option value="binance">Binance</option>
          <option value="bybit">Bybit</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>AI Model</Label>
        <ModelCombobox models={AI_MODELS} value={formData.model ?? ''} onSelect={(value) => handleChange('model', value)} disabled={isDisabled} />
        {selectedModel?.description && <p className="text-xs text-gray-400 mt-2 px-1">{selectedModel.description}</p>}
        {errors.model && <p className="text-sm text-red-400 mt-1">{errors.model}</p>}
      </div>

      <div className="space-y-2">
        <Label>Symbol</Label>
        <Combobox symbols={symbols} value={formData.symbol ?? ''} onSelect={(value) => handleChange('symbol', value)} disabled={isDisabled} favorites={favorites} setFavorites={setFavorites} />
        {errors.symbol && <p className="text-sm text-red-400 mt-1">{errors.symbol}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="chart-interval">Chart Interval</Label>
          <Select id="chart-interval" value={formData.timeframe} onValueChange={(value) => handleChange('timeframe', value as Timeframe)} disabled={isDisabled}>
            {scalpingTimeframes.map(tf => (
              <option key={tf.value} value={tf.value}>{tf.label}</option>
            ))}
          </Select>
          {errors.timeframe && <p className="text-sm text-red-400 mt-1">{errors.timeframe}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="trading-style">Trading Style</Label>
          <Select id="trading-style" value={formData.tradingStyle} onValueChange={(value) => handleChange('tradingStyle', value)} disabled={isDisabled}>
            <option value="Balanced">Balanced</option>
            <option value="Momentum Breakout">Momentum Breakout</option>
            <option value="Liquidity Sweep">Liquidity Sweep</option>
            <option value="Range Scalp">Range Scalp</option>
          </Select>
        </div>
      </div>
      {formData.timeframe && TIMEFRAME_DESCRIPTIONS[formData.timeframe as Timeframe] && (
        <div className="mt-2 px-2 text-xs text-gray-400 space-y-1">
          <p className="font-bold text-cyan-400">{TIMEFRAME_DESCRIPTIONS[formData.timeframe as Timeframe].name}</p>
          <p>{TIMEFRAME_DESCRIPTIONS[formData.timeframe as Timeframe].description}</p>
        </div>
      )}
    </>
  );
};