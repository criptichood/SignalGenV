import React, { useState } from 'react';
import { useStore } from '@/store';
import { useHistoryStore } from '@/store/historyStore';
import { useSimulationStore } from '@/store/simulationStore';
import type { SavedSignal, SimulationSetup, Page, UserParams } from '@/types';
import { HistoryTable } from '@/components/HistoryTable';
import { SignalDetailModal } from '@/components/SignalDetailModal';
import { useSignalGenStore } from '@/store/signalGenStore';
import { useScalpingStore } from '@/store/scalpingStore';

export default function HistoryPage() {
  const { setCurrentPage, setToast } = useStore();
  const { signalHistory, setSignalHistory } = useHistoryStore();
  const { setSimulations } = useSimulationStore();
  const { setFormData: setSignalGenFormData } = useSignalGenStore();
  const { setFormData: setScalpFormData } = useScalpingStore();

  const [selectedSignal, setSelectedSignal] = useState<SavedSignal | null>(null);

  const handleDelete = (id: string) => {
    setSignalHistory(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateStatus = (id: string, status: SavedSignal['status']) => {
    setSignalHistory(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleViewDetails = (signal: SavedSignal) => {
    setSelectedSignal(signal);
  };

  const handleSimulate = (signal: SavedSignal) => {
    const newSimulation: SimulationSetup = {
        id: `sim-${signal.id}`,
        exchange: 'binance', // Assuming default, could be part of saved signal later
        symbol: signal.symbol,
        direction: signal.direction,
        entryRange: signal.entryRange,
        takeProfit: signal.takeProfit,
        stopLoss: signal.stopLoss,
        leverage: signal.leverage,
        timestamp: Date.now(), // Sim start time
        endTime: Date.now() + 8 * 60 * 60 * 1000, // 8 hours from now
        mode: 'replay',
        status: 'pending',
    };
    setSimulations(prev => [newSimulation, ...prev]);
    setCurrentPage('simulation');
  };
  
  const handleRestore = (signalToRestore: SavedSignal) => {
      const isScalp = signalToRestore.type === 'Scalp';
      const page: Page = isScalp ? 'scalping' : 'signal-gen';

      const formData: Partial<UserParams> = {
          symbol: signalToRestore.symbol,
          timeframe: signalToRestore.timeframe,
          leverage: signalToRestore.leverage,
      };

      if (isScalp) {
          setScalpFormData(prev => ({ ...prev, ...formData }));
      } else {
          setSignalGenFormData(prev => ({ ...prev, ...formData }));
      }
      setCurrentPage(page);
  };


  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold">AI Signal History</h1>
            <p className="text-gray-400 mt-1">Review, manage, and backtest all previously generated signals.</p>
        </div>

        <HistoryTable 
            data={signalHistory}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
            onViewDetails={handleViewDetails}
            onSimulate={handleSimulate}
            onRestore={handleRestore}
        />

        {selectedSignal && (
            <SignalDetailModal 
                signal={selectedSignal}
                onClose={() => setSelectedSignal(null)}
                setToast={setToast}
            />
        )}
    </div>
  );
}