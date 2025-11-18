import React from 'react';
import type { UserParams } from '@/types';
import { Accordion } from '@/components/ui/Accordion';
import { Select } from '@/components/ui/Select';
import { NumberInput } from '@/components/ui/NumberInput';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { SlidersHorizontalIcon } from '@/components/icons/SlidersHorizontalIcon';

interface AdvancedParamsProps {
  formData: Partial<UserParams>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<UserParams>>>;
  errors: Record<string, string>;
  isDisabled?: boolean;
}

export const AdvancedParams = ({ formData, setFormData, errors, isDisabled }: AdvancedParamsProps) => {
  const handleChange = (field: keyof UserParams, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberInputChange = (field: keyof UserParams, value: string) => {
    const num = Number(value);
    if (!isNaN(num)) {
      handleChange(field, num);
    }
  };

  return (
    <Accordion trigger={<div className="flex items-center gap-2"><SlidersHorizontalIcon className="w-4 h-4" /><span>Risk Parameters</span></div>}>
      <div className="pt-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="margin">Margin ($)</Label>
            <NumberInput id="margin" value={formData.margin ?? ''} onValueChange={(val) => handleNumberInputChange('margin', val)} disabled={isDisabled} placeholder="1000" />
            {errors.margin && <p className="text-sm text-red-400 mt-1">{errors.margin}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="risk">Risk (%)</Label>
            <NumberInput id="risk" value={formData.risk ?? ''} onValueChange={(val) => handleNumberInputChange('risk', val)} disabled={isDisabled} placeholder="0.5" step={0.1} />
            {errors.risk && <p className="text-sm text-red-400 mt-1">{errors.risk}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="leverage">Leverage</Label>
          <Select id="leverage" value={String(formData.leverage)} onValueChange={(value) => handleChange('leverage', value === 'custom' ? 'custom' : Number(value))} disabled={isDisabled}>
            <option value={5}>5x</option>
            <option value={10}>10x</option>
            <option value={20}>20x</option>
            <option value={30}>30x</option>
            <option value="custom">Custom</option>
          </Select>
        </div>
        {formData.leverage === 'custom' && (
          <div className="space-y-2 pl-2 border-l-2 border-gray-700">
            <Label htmlFor="custom-leverage">Custom Leverage</Label>
            <NumberInput id="custom-leverage" value={formData.customLeverage ?? ''} onValueChange={(val) => handleNumberInputChange('customLeverage', val)} placeholder="e.g., 50" disabled={isDisabled} />
            {errors.customLeverage && <p className="text-sm text-red-400 mt-1">{errors.customLeverage}</p>}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="allow-high-leverage">Allow AI High Leverage (&gt;20x)</Label>
            <p className="text-xs text-gray-500">Permits AI to use over 20x on 90%+ confidence signals.</p>
          </div>
          <Switch id="allow-high-leverage" checked={formData.allowHighLeverage ?? false} onCheckedChange={(checked) => handleChange('allowHighLeverage', checked)} disabled={isDisabled} />
        </div>
      </div>
    </Accordion>
  );
};