import React, { useState, useEffect } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import * as exchangeService from '@/services/exchangeService';
import { useExchangeWebSocket } from '@/hooks/useExchangeWebSocket';
import type { SimulationSetup, CandleStick, Page } from '@/types';
import { CreateSimulationModal } from '@/components/simulation/CreateSimulationModal';
import { SimulationHistoryTable } from '@/components/simulation/SimulationHistoryTable';
import { SimulationPlaybackView } from '@/components/simulation/SimulationPlaybackView';
import { SimulationStatsSummary } from '@/components/simulation/SimulationStatsSummary';
import { SimulationEmptyState } from '@/components/simulation/SimulationEmptyState';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useChartDataQuery } from '@/hooks/useChartDataQuery';
import { useSymbolsQuery } from '@/hooks/useSymbolsQuery';

export default function SimulationPage() {
  const {
    simulations,
    setSimulations,
    exchange,
    setExchange,
    activeSimulation,
    setActiveSimulation,
    isAutoPlay,
    setIsAutoPlay,
  } = useSimulationStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: symbols = [], error: symbolsError } = useSymbolsQuery(exchange);
  
  const { 
    data: liveChartData, 
    isLoading: isChartLoading, 
    error: chartDataError 
  } = useChartDataQuery(
    activeSimulation?.mode === 'live' ? activeSimulation.exchange : undefined, 
    activeSimulation?.mode === 'live' ? activeSimulation.symbol : undefined
  );
  

  const handleSaveSimulation = (setup: SimulationSetup, startImmediately: boolean) => {
    setSimulations(prev => {
        const existingIndex = prev.findIndex(s => s.id === setup.id);
        if (existingIndex > -1) {
            const newSims = [...prev];
            newSims[existingIndex] = setup;
            return newSims;
        }
        return [setup, ...prev];
    });
    if (startImmediately) {
      handleStartSimulation(setup);
    }
    setIsModalOpen(false);
  };

  const handleDeleteSimulation = (id: string) => {
    setSimulations(prev => prev.filter(sim => sim.id !== id));
    if (activeSimulation?.id === id) {
      setActiveSimulation(null);
    }
  };

  const handleStartSimulation = async (sim: SimulationSetup) => {
    setIsAutoPlay(true);
    if (sim.mode === 'replay') {
      // Fetch 1m data for the replay period.
      const startTimeMs = sim.timestamp;
      const endTimeMs = sim.endTime;
      try {
        const historicalData = await exchangeService.fetchHistoricalData(sim.exchange, sim.symbol, '1m', startTimeMs, endTimeMs);
        const simWithData = { ...sim, historicalData };
        setActiveSimulation(simWithData);
      } catch (error) {
        console.error("Failed to fetch historical data for replay:", error);
        // You might want to show an error to the user here.
      }
    } else { // live mode
      setActiveSimulation(sim);
    }
  };

  const handleComplete = (result: SimulationSetup) => {
    setSimulations(prev => prev.map(s => s.id === result.id ? result : s));
    setIsAutoPlay(false);
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Simulation</h1>
          <p className="text-gray-400 mt-1">Backtest strategies against historical data or in a live market.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Create Simulation
        </Button>
      </div>

      {symbolsError && <ErrorMessage message={symbolsError.message} onClose={() => {}} />}
      
      {activeSimulation ? (
        <SimulationPlaybackView 
          simulation={activeSimulation}
          onCloseView={() => setActiveSimulation(null)}
          onComplete={handleComplete}
          onPause={() => setIsAutoPlay(false)}
          onResume={() => setIsAutoPlay(true)}
          autoPlay={isAutoPlay}
          liveChartData={liveChartData}
          isChartLoading={isChartLoading}
        />
      ) : (
        <SimulationEmptyState />
      )}

      <SimulationStatsSummary simulations={simulations} />

      <SimulationHistoryTable 
        simulations={simulations}
        onDelete={handleDeleteSimulation}
        onStart={handleStartSimulation}
        isLoading={isChartLoading && activeSimulation?.mode === 'live'}
      />

      <CreateSimulationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        symbols={symbols}
        onSave={handleSaveSimulation}
        exchange={exchange}
        setExchange={setExchange}
      />
    </div>
  );
}