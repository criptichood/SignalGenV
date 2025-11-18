import React from 'react';
import { useStore } from '@/store';
import { useHistoryStore } from '@/store/historyStore';
import { useScalpingStore } from '@/store/scalpingStore';
import { useSymbolsQuery } from '@/hooks/useSymbolsQuery';
import { useChartDataQuery } from '@/hooks/useChartDataQuery';
import { useManualSignalStore } from '@/store/manualSignalStore';
import ManualStudioLayout from '@/components/manual-studio/ManualStudioLayout';
import { FloatingWindows } from '@/components/scalping/FloatingWindows';
import type { SavedSignal, Signal } from '@/types';

export default function ManualStudioPage() {
    const { setToast } = useStore();
    const { setSignalHistory } = useHistoryStore();
    const { trackedSignals, setTrackedSignals } = useScalpingStore();

    const {
        formData,
        setFormData,
        manualSignal,
        setManualSignal,
        aiFeedback,
        setAiFeedback,
        isStaging,
        setIsStaging,
    } = useManualSignalStore();
    
    const { data: symbols = [], error: symbolsQueryError } = useSymbolsQuery(formData.exchange);
    const { data: chartData, isLoading: isChartLoading, error: chartDataError } = useChartDataQuery(formData.exchange, formData.symbol);

    const handleStageSignal = () => {
        if (!manualSignal) {
            setToast({ message: 'Cannot stage an incomplete signal.', variant: 'error' });
            return;
        }

        setIsStaging(true);
        setToast({ message: 'Staging your manual signal...', variant: 'success' });
        
        setTimeout(() => {
            let combinedReasoning = formData.reasoning || 'Manually created signal.';
            if (aiFeedback) {
                combinedReasoning += `\n\n--- AI Second Opinion ---\n${aiFeedback.rationale}`;
                if (aiFeedback.refinements) {
                    combinedReasoning += `\n\n**Refinements:** ${aiFeedback.refinements}`;
                }
            }

            const stagedSignal: SavedSignal = {
                ...manualSignal,
                id: crypto.randomUUID(),
                symbol: formData.symbol!,
                timeframe: formData.timeframe!,
                timestamp: Date.now(),
                status: 'Pending',
                currentPrice: chartData ? chartData[chartData.length - 1].close : 0,
                type: 'Manual',
                confidence: aiFeedback?.confidence ?? 0,
                reasoning: combinedReasoning,
                tradeDuration: formData.duration,
            };
            
            // Add to history
            setSignalHistory(prev => [stagedSignal, ...prev]);

            // Add to live tracker
            setTrackedSignals(prev => [...prev, {
                id: stagedSignal.id,
                signal: stagedSignal,
                params: { ...formData, model: '' } as any, // model is not relevant for manual
                timestamp: stagedSignal.timestamp,
                windowState: { isOpen: true, isMinimized: false, position: { x: window.innerWidth - 340, y: 96 } }
            }]);

            setIsStaging(false);
            setToast({ message: 'Signal tracking started!', variant: 'success' });
        }, 1000); // Simulate async operation
    };
    
    const handleCloseTracker = (id: string) => setTrackedSignals(prev => prev.filter(ts => ts.id !== id));
    const handleToggleMinimizeTracker = (id: string) => setTrackedSignals(prev => prev.map(ts => ts.id === id ? { ...ts, windowState: { ...ts.windowState, isMinimized: !ts.windowState.isMinimized } } : ts));
    const handleTrackerPositionChange = (id: string, pos: { x: number; y: number }) => setTrackedSignals(prev => prev.map(ts => ts.id === id ? { ...ts, windowState: { ...ts.windowState, position: pos } } : ts));

    return (
        <>
            <ManualStudioLayout
                formData={formData}
                setFormData={setFormData}
                symbols={symbols}
                symbolsQueryError={symbolsQueryError}
                chartData={chartData || []}
                isChartLoading={isChartLoading}
                chartDataError={chartDataError}
                manualSignal={manualSignal}
                setManualSignal={setManualSignal}
                aiFeedback={aiFeedback}
                setAiFeedback={setAiFeedback}
                isStaging={isStaging}
                onStageSignal={handleStageSignal}
            />
            <FloatingWindows
                // Dummy props for windows not used on this page
                windowsState={{
                    orderBook: { isOpen: false, isMinimized: false, position: { x: 0, y: 0 } },
                    timeAndSales: { isOpen: false, isMinimized: false, position: { x: 0, y: 0 } },
                    favorites: { isOpen: false, isMinimized: false, position: { x: 0, y: 0 } },
                }}
                handlePositionChange={() => {}}
                toggleWindow={() => {}}
                toggleMinimize={() => {}}
                favoriteScalpSymbols={[]}
                handleSelectFavorite={() => {}}
                handleGenerateForFavorite={() => {}}
                isAnalyzing={false}
                symbol={undefined}
                orderBookData={null}
                livePrice={null}
                liveTrades={[]}
                
                // Real props for trackers
                trackedSignals={trackedSignals}
                handleCloseTracker={handleCloseTracker}
                handleToggleMinimizeTracker={handleToggleMinimizeTracker}
                handleTrackerPositionChange={handleTrackerPositionChange}
                handleRestoreSignal={() => { setToast({ message: 'Restore view is only available on Scalping page.', variant: 'warning'}) }}
            />
        </>
    );
}