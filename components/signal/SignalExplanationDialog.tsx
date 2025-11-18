

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { explainSignal } from '@/services/geminiService';
import { Loader2Icon } from '@/components/icons/Loader2Icon';
import { SparklesIcon } from '@/components/icons/SparklesIcon';
import { FormattedReasoning } from '@/components/FormattedReasoning';

interface SignalExplanationDialogProps {
  symbol: string;
  reasoning: string;
  onClose: () => void;
}

export const SignalExplanationDialog = ({ symbol, reasoning, onClose }: SignalExplanationDialogProps) => {
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateExplanation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await explainSignal(symbol, reasoning);
        setExplanation(result);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred.');
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    generateExplanation();
  }, [symbol, reasoning]);
  
  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-400">
                <Loader2Icon className="w-8 h-8 animate-spin mb-4" />
                <p className="font-semibold">AI is generating a detailed explanation...</p>
                <p className="text-sm text-gray-500">This may take a moment.</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-[200px] text-red-400 bg-red-900/30 p-4 rounded-md">
                <h3 className="font-bold mb-2">Failed to Generate Explanation</h3>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <FormattedReasoning text={explanation} />
        </div>
    );
  }

  return (
    <Dialog isOpen={true} onClose={onClose} title={`Explanation for ${symbol} Signal`}>
        <div className="flex items-start gap-3 mb-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
            <SparklesIcon className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-400">
                This is an AI-generated explanation of the trading concepts behind the signal. It may not be 100% accurate. Always do your own research.
            </p>
        </div>
        {renderContent()}
    </Dialog>
  );
};