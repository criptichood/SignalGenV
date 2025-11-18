import React, { useState, useEffect, useRef } from 'react';
import type { Signal, SavedSignal, UserParams } from '@/types';
import { BybitTradeDetails } from '@/services/executionService';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { ClockIcon } from '@/components/icons/ClockIcon';
import { parseDurationToMillis } from '@/utils/date';
import { SignalExplanationDialog } from './SignalExplanationDialog';
import { PLForecasterModal } from './PLForecasterModal';

// Import Decomposed Components
import { LoadingState } from './states/LoadingState';
import { EmptyState } from './states/EmptyState';
import { SignalCardHeader } from './sections/SignalCardHeader';
import { SignalCardLevels } from './sections/SignalCardLevels';
import { SignalCardMetrics } from './sections/SignalCardMetrics';
import { SignalCardBias } from './sections/SignalCardBias';
import { SignalCardAnalysis } from './sections/SignalCardAnalysis';
import { SignalCardFooter } from './SignalCardFooter';
import { SignalExecutionModal } from './SignalExecutionModal';


type DisplaySignal = (Signal & { symbol: string; currentPrice: number; timestamp: number; lastDataTimestamp?: number; type?: 'Scalp' | 'Swing' }) | SavedSignal;

interface SignalCardProps {
  signal: DisplaySignal | null;
  isLoading: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  viewContext?: 'generation' | 'history';
  isNew?: boolean;
  onUpdateSignal?: (updates: Partial<Signal>) => void;
  currentParams?: UserParams | null;
  onExecute?: (tradeDetails: BybitTradeDetails) => Promise<any>;
  isExecuted?: boolean;
  onExpire?: () => void;
  setToast: (toast: { message: string; variant: 'success' | 'warning' | 'error' } | null) => void;
  onShareAsPost?: () => void;
}

export const SignalCard = ({ 
    signal, 
    isLoading, 
    isFavorite,
    onToggleFavorite,
    viewContext = 'generation',
    isNew = false,
    onUpdateSignal,
    currentParams,
    onExecute,
    isExecuted,
    onExpire,
    setToast,
    onShareAsPost,
}: SignalCardProps) => {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [isForecasterOpen, setIsForecasterOpen] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [executionType, setExecutionType] = useState<'market' | 'trailing' | null>(null);
  const [extendedDurationMs, setExtendedDurationMs] = useState(0);
  const onExpireCalled = useRef(false);

  useEffect(() => {
    onExpireCalled.current = false;
    setExtendedDurationMs(0);
  }, [signal?.timestamp]);

  useEffect(() => {
    if (!signal) {
      setIsExpired(false);
      setRemainingTime(null);
      return;
    }

    const maxDuration = parseDurationToMillis(signal.tradeDuration);
    if (maxDuration === null) {
      setIsExpired(false);
      setRemainingTime(null);
      return;
    }

    const expiryTime = signal.timestamp + maxDuration + extendedDurationMs;
    const initialTimeLeft = expiryTime - Date.now();
    if (initialTimeLeft <= 0) {
      setRemainingTime(0);
      setIsExpired(true);
      if (!onExpireCalled.current) { onExpire?.(); onExpireCalled.current = true; }
    } else {
      setRemainingTime(initialTimeLeft);
      setIsExpired(false);
    }

    const intervalId = setInterval(() => {
      const timeLeft = expiryTime - Date.now();
      if (timeLeft <= 0) {
        setRemainingTime(0);
        setIsExpired(true);
        if (!onExpireCalled.current) { onExpire?.(); onExpireCalled.current = true; }
        clearInterval(intervalId);
      } else {
        setRemainingTime(timeLeft);
        setIsExpired(false);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [signal, onExpire, extendedDurationMs]);


  if (isLoading) return <LoadingState />;
  if (!signal) return <EmptyState />;
  
  const handleExecute = (details: BybitTradeDetails) => {
    onExecute?.(details).catch(err => console.error("Trade execution failed:", err));
    setExecutionType(null);
  };
  
  const isLong = signal.direction === 'LONG';
  const glowClass = isNew ? (isLong ? 'animate-glow-green' : 'animate-glow-red') : '';
  const canExecute = !!onExecute && !isExpired && !isExecuted;

  return (
    <>
      <Card className={`relative backdrop-blur-sm bg-gray-800/70 transition-all duration-300 ${glowClass}`}>
        {executionType && currentParams && (
            <SignalExecutionModal
                signal={signal as Signal & { symbol: string }}
                currentParams={currentParams}
                executionType={executionType}
                onConfirm={handleExecute}
                onCancel={() => setExecutionType(null)}
                setToast={setToast}
            />
        )}
        {viewContext === 'generation' && isExpired && (
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg text-center p-4">
            <ClockIcon className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-2xl font-bold text-white">Signal Expired</h3>
            <p className="text-gray-400 mt-1">Please generate a new signal for the latest analysis.</p>
          </div>
        )}
        <SignalCardHeader
            signal={signal}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            remainingTime={remainingTime}
            isExpired={isExpired}
            setExtendedDurationMs={setExtendedDurationMs}
            viewContext={viewContext}
        />

        <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SignalCardLevels signal={signal} onUpdateSignal={onUpdateSignal} isExpired={isExpired} />
                <SignalCardMetrics signal={signal} />
            </div>
            <SignalCardBias biasSummary={signal.biasSummary} />
            <SignalCardAnalysis reasoning={signal.reasoning} />
        </CardContent>

        <CardFooter>
            <SignalCardFooter
                viewContext={viewContext}
                isExpired={isExpired}
                canExecute={canExecute}
                onExplainClick={() => setIsExplanationOpen(true)}
                onForecastClick={() => setIsForecasterOpen(true)}
                onShareAsPost={onShareAsPost}
                onExecuteClick={(type) => setExecutionType(type)}
            />
        </CardFooter>
      </Card>
      
      {isExplanationOpen && (
        <SignalExplanationDialog
          symbol={signal.symbol}
          reasoning={signal.reasoning}
          onClose={() => setIsExplanationOpen(false)}
        />
      )}
      
      {isForecasterOpen && currentParams && (
        <PLForecasterModal
            isOpen={isForecasterOpen}
            onClose={() => setIsForecasterOpen(false)}
            signal={signal as Signal & { symbol: string; }}
            params={currentParams}
        />
      )}
    </>
  );
};