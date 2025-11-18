import React, { useState } from 'react';
import type { UserParams, AiModel } from '@/types';
import { AI_MODELS } from '@/constants';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Zap, Loader2, X, Star } from 'lucide-react';
import { PresetControls } from '@/components/controls/PresetControls';
import { AutoExecutionControls } from '@/components/controls/AutoExecutionControls';
import { AutopilotControls } from './controls/AutopilotControls';
import { OneClickTradingControls } from './controls/OneClickTradingControls';
import { CoreParams } from './controls/CoreParams';
import { AdvancedParams } from './controls/AdvancedParams';

// This is a large props interface, matching what's passed from ScalpingLayout.tsx
interface ScalpingControlsProps {
  symbols: string[];
  isAnalyzing: boolean;
  onSubmit: (params: UserParams, model: AiModel) => void;
  onCancel: () => void;
  formData: Partial<UserParams>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<UserParams>>>;
  scalpingPresets: any[];
  setScalpingPresets: React.Dispatch<React.SetStateAction<any[]>>;
  onClose: () => void;
  onToggleFavoritesWindow: () => void;
  isAutoExecutionEnabled: boolean;
  setIsAutoExecutionEnabled: (enabled: boolean) => void;
  autoExecutionThreshold: number;
  setAutoExecutionThreshold: (threshold: number) => void;
  autoExecutionType: 'market' | 'trailing';
  setAutoExecutionType: (type: 'market' | 'trailing') => void;
  oneClickTradingEnabled: boolean;
  setOneClickTradingEnabled: (enabled: boolean) => void;
  autopilotState: any;
  onToggleAutopilot: () => void;
  autopilotSettings: any;
  onAutopilotSettingsChange: (settings: any) => void;
  autopilotSessionStats: any;
  bybitApiKey: string;
  bybitApiSecret: string;
  setToast: (toast: { message: string; variant: 'success' | 'warning' | 'error' }) => void;
  autopilotScanMode: any;
  setAutopilotScanMode: (mode: any) => void;
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
}

const validateForm = (data: Partial<UserParams>): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!data.symbol) errors.symbol = "Symbol is required.";
    if (!data.model) errors.model = "AI Model is required.";
    if (!data.timeframe) errors.timeframe = "Chart Interval is required.";
    return errors;
};

export const ScalpingControls = (props: ScalpingControlsProps) => {
  const { isAnalyzing, onSubmit, onCancel, formData, setFormData, onClose, onToggleFavoritesWindow, autopilotState } = props;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isAutopilotActive = autopilotState !== 'inactive' && autopilotState !== 'stopped';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const selectedModel = AI_MODELS.find(m => m.id === formData.model);
    if (selectedModel) {
      onSubmit(formData as UserParams, selectedModel);
    } else {
      setErrors({ model: "Selected AI model is invalid." });
    }
  };

  const handleAutoExecToggle = (checked: boolean) => {
    if (checked && (!props.bybitApiKey || !props.bybitApiSecret)) {
        props.setToast({ message: 'Set Bybit API keys in Settings to enable Auto Execution.', variant: 'error' });
        return;
    }
    props.setIsAutoExecutionEnabled(checked);
  };

  return (
    <form onSubmit={handleSubmit} className="h-full">
      <Card className="flex flex-col h-full rounded-none lg:rounded-r-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3"><Zap className="w-6 h-6 text-cyan-400" /><CardTitle>AI Scalping Assistant</CardTitle></div>
            <div className="flex items-center -mr-2 -mt-2">
              <button type="button" onClick={onToggleFavoritesWindow} className="p-2 rounded-full hover:bg-gray-700" aria-label="Toggle favorite pairs"><Star className="w-6 h-6 text-yellow-300" fill="currentColor" /></button>
              <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-700" aria-label="Close controls"><X className="w-6 h-6 text-gray-300" /></button>
            </div>
          </div>
          <CardDescription>Find short-term scalping opportunities.</CardDescription>
        </CardHeader>
        <div className="flex-grow overflow-y-auto">
          <CardContent className="space-y-6">
            <PresetControls
              presets={props.scalpingPresets}
              setPresets={props.setScalpingPresets}
              formData={formData}
              setFormData={setFormData as any}
              isDisabled={isAnalyzing || isAutopilotActive}
            />
            <OneClickTradingControls
              isOneClickTradingEnabled={props.oneClickTradingEnabled}
              setIsOneClickTradingEnabled={props.setOneClickTradingEnabled}
              isDisabled={isAnalyzing || isAutopilotActive}
            />
            <AutoExecutionControls
              isAutoExecutionEnabled={props.isAutoExecutionEnabled}
              setIsAutoExecutionEnabled={props.setIsAutoExecutionEnabled}
              autoExecutionThreshold={props.autoExecutionThreshold}
              setAutoExecutionThreshold={props.setAutoExecutionThreshold}
              autoExecutionType={props.autoExecutionType}
              setAutoExecutionType={props.setAutoExecutionType}
              isDisabled={isAnalyzing || isAutopilotActive}
              onToggle={handleAutoExecToggle}
            />
            <AutopilotControls
              autopilotState={props.autopilotState}
              onToggleAutopilot={props.onToggleAutopilot}
              autopilotSettings={props.autopilotSettings}
              onAutopilotSettingsChange={props.onAutopilotSettingsChange}
              autopilotSessionStats={props.autopilotSessionStats}
              autopilotScanMode={props.autopilotScanMode}
              setAutopilotScanMode={props.setAutopilotScanMode}
              isDisabled={isAutopilotActive}
              isToggleDisabled={!isAutopilotActive && (!props.isAutoExecutionEnabled || isAnalyzing)}
            />
            <CoreParams
              formData={formData}
              setFormData={setFormData as any}
              errors={errors}
              symbols={props.symbols}
              favorites={props.favorites}
              setFavorites={props.setFavorites}
              isDisabled={isAnalyzing || isAutopilotActive}
            />
            <AdvancedParams
              formData={formData}
              setFormData={setFormData as any}
              errors={errors}
              isDisabled={isAnalyzing || isAutopilotActive}
            />
          </CardContent>
        </div>
        <CardFooter>
          {isAnalyzing ? (
             <div className="w-full flex gap-3">
                <Button disabled className="w-full flex-1">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding...
                </Button>
                <Button onClick={onCancel} variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                    <X className="h-4 w-4" />
                </Button>
            </div>
          ) : (
            <Button type="submit" disabled={isAutopilotActive} className="w-full">
              Find Scalp Opportunity
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  );
};