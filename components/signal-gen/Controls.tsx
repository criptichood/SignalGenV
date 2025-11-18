import React, { useState } from 'react';
import type { UserParams, AiModel } from '@/types';
import { AI_MODELS } from '@/constants';
import { useSignalGenStore } from '@/store/signalGenStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { SparklesIcon } from '@/components/icons/SparklesIcon';
import { Loader2Icon } from '@/components/icons/Loader2Icon';
import { CloseIcon } from '@/components/icons/CloseIcon';
import { StarIcon } from '@/components/icons/StarIcon';
import { PresetControls } from '@/components/controls/PresetControls';
import { AutoExecutionControls } from '@/components/controls/AutoExecutionControls';
import { ScannerControls } from './controls/ScannerControls';
import { CoreParams } from './controls/CoreParams';
import { AdvancedParams } from './controls/AdvancedParams';

interface ControlsProps {
  symbols: string[];
  isAnalyzing: boolean;
  onSubmit: (params: UserParams, model: AiModel) => void;
  onCancel: () => void;
}

const validateForm = (data: Partial<UserParams>): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!data.symbol) errors.symbol = "Symbol is required.";
    if (!data.model) errors.model = "AI Model is required.";
    if (!data.timeframe) errors.timeframe = "Chart Interval is required.";
    if (data.margin !== undefined && data.margin < 0) errors.margin = "Margin must be positive.";
    if (data.risk !== undefined && (data.risk <= 0 || data.risk > 100)) errors.risk = "Risk must be between 0 and 100.";
    if (data.leverage === 'custom' && (!data.customLeverage || data.customLeverage <= 0)) {
        errors.customLeverage = "Custom leverage must be a positive number.";
    }
    return errors;
};

export const Controls = ({ symbols, isAnalyzing, onSubmit, onCancel }: ControlsProps) => {
  const store = useSignalGenStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(store.formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const selectedModel = AI_MODELS.find(m => m.id === store.formData.model);
    if (selectedModel) {
      onSubmit(store.formData as UserParams, selectedModel);
    } else {
      setErrors({ model: "Selected AI model is invalid." });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="h-full" data-tour-id="signal-gen-controls">
      <Card className="flex flex-col h-full rounded-none lg:rounded-r-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 text-cyan-400" />
              <CardTitle>AI Signal Generator</CardTitle>
            </div>
            <div className="flex items-center -mr-2 -mt-2">
              <button type="button" onClick={() => store.toggleWindow('favorites')} className="p-2 rounded-full hover:bg-gray-700" aria-label="Toggle favorite pairs">
                <StarIcon className="w-6 h-6 text-yellow-300" />
              </button>
              <button type="button" onClick={() => store.setIsControlsOpen(false)} className="p-2 rounded-full hover:bg-gray-700" aria-label="Close controls">
                <CloseIcon className="w-6 h-6 text-gray-300" />
              </button>
            </div>
          </div>
          <CardDescription>Configure parameters to generate a new trading signal.</CardDescription>
        </CardHeader>

        <div className="flex-grow overflow-y-auto">
          <CardContent className="space-y-6">
            <PresetControls
              presets={store.swingPresets}
              setPresets={store.setSwingPresets}
              formData={store.formData}
              setFormData={store.setFormData}
              isDisabled={isAnalyzing}
            />
            <ScannerControls
              isScannerEnabled={store.isScannerEnabled}
              setIsScannerEnabled={store.setIsScannerEnabled}
              isScanningSymbol={store.isScanningSymbol}
              scannerTimeframe={store.scannerTimeframe}
              setScannerTimeframe={store.setScannerTimeframe}
              isDisabled={isAnalyzing}
            />
            <AutoExecutionControls
              isAutoExecutionEnabled={store.isAutoExecutionEnabled}
              setIsAutoExecutionEnabled={store.setIsAutoExecutionEnabled}
              autoExecutionThreshold={store.autoExecutionThreshold}
              setAutoExecutionThreshold={store.setAutoExecutionThreshold}
              autoExecutionType={store.autoExecutionType}
              setAutoExecutionType={store.setAutoExecutionType}
              isDisabled={isAnalyzing}
            />
            <CoreParams
              formData={store.formData}
              setFormData={store.setFormData}
              errors={errors}
              symbols={symbols}
              favorites={store.favoriteSwingSymbols}
              setFavorites={store.setFavoriteSwingSymbols}
              isDisabled={isAnalyzing}
            />
            <AdvancedParams
              formData={store.formData}
              setFormData={store.setFormData}
              errors={errors}
              isDisabled={isAnalyzing}
            />
          </CardContent>
        </div>
        
        <CardFooter>
          {isAnalyzing ? (
            <div className="w-full flex gap-3">
                <Button disabled className="w-full flex-1">
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                </Button>
                <Button onClick={onCancel} variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                    <CloseIcon className="h-4 w-4" />
                </Button>
            </div>
          ) : (
            <Button type="submit" disabled={store.isScannerEnabled} className="w-full" data-tour-id="generate-signal-button">
                Get AI Signal
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  );
};