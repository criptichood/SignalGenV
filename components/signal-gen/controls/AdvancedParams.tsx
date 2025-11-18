import React from 'react';
import type { UserParams } from '@/types';
import { Accordion } from '@/components/ui/Accordion';
import { Select } from '@/components/ui/Select';
import { NumberInput } from '@/components/ui/NumberInput';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
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
    <Accordion trigger={<div className="flex items-center gap-2"><SlidersHorizontalIcon className="w-4 h-4" /><span>Advanced Parameters</span></div>}>
      <div className="pt-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="opportunity-duration">Opportunity Duration</Label>
          <Select id="opportunity-duration" value={formData.opportunityDuration} onValueChange={(value) => handleChange('opportunityDuration', value)} disabled={isDisabled}>
            <option value="Any time frame">Any time frame</option>
            <option value="5m - 30m">5m - 30m</option>
            <option value="30m - 1hr">30m - 1hr</option>
            <option value="1hr - 2hr">1hr - 2hr</option>
            <option value="4hr - 6hr">4hr - 6hr</option>
            <option value="6hr - 12hr">6hr - 12hr</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="margin">Margin ($)</Label>
            <NumberInput id="margin" value={formData.margin ?? ''} onValueChange={(val) => handleNumberInputChange('margin', val)} disabled={isDisabled} placeholder="1000" />
            {errors.margin && <p className="text-sm text-red-400 mt-1">{errors.margin}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="risk">Risk (%)</Label>
            <NumberInput id="risk" value={formData.risk ?? ''} onValueChange={(val) => handleNumberInputChange('risk', val)} disabled={isDisabled} placeholder="1" step={0.1} />
            {errors.risk && <p className="text-sm text-red-400 mt-1">{errors.risk}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="leverage">Leverage</Label>
          <Select id="leverage" value={String(formData.leverage)} onValueChange={(value) => handleChange('leverage', value === 'custom' ? 'custom' : Number(value))} disabled={isDisabled}>
            <option value={10}>10x</option>
            <option value={20}>20x</option>
            <option value={50}>50x</option>
            <option value="custom">Custom</option>
          </Select>
        </div>
        {formData.leverage === 'custom' && (
          <div className="space-y-2 pl-2 border-l-2 border-gray-700">
            <Label htmlFor="custom-leverage">Custom Leverage</Label>
            <NumberInput id="custom-leverage" value={formData.customLeverage ?? ''} onValueChange={(val) => handleNumberInputChange('customLeverage', val)} placeholder="e.g., 100" disabled={isDisabled} />
            {errors.customLeverage && <p className="text-sm text-red-400 mt-1">{errors.customLeverage}</p>}
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Switch id="force-leverage" checked={formData.forceLeverage ?? false} onCheckedChange={(checked) => handleChange('forceLeverage', checked)} disabled={isDisabled} />
          <Label htmlFor="force-leverage">Force Use Leverage</Label>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="allow-high-leverage">Allow AI High Leverage (&gt;20x)</Label>
            <p className="text-xs text-gray-500">Permits AI to use over 20x on 90%+ confidence signals.</p>
          </div>
          <Switch id="allow-high-leverage" checked={formData.allowHighLeverage ?? false} onCheckedChange={(checked) => handleChange('allowHighLeverage', checked)} disabled={isDisabled} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="custom-params">Custom AI Parameters</Label>
          <Textarea id="custom-params" value={formData.customAiParams} onChange={(e) => handleChange('customAiParams', e.target.value)} placeholder="e.g., 'focus on short-term scalping signals'" disabled={isDisabled} />
        </div>
      </div>
    </Accordion>
  );
};