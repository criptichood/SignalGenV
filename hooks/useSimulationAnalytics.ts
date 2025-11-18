import { useMemo } from 'react';
import type { SimulationSetup } from '@/types';

export function useSimulationAnalytics(simulations: SimulationSetup[]) {
    const stats = useMemo(() => {
        const completedSims = simulations.filter(s => s.status === 'completed' && s.result);

        if (completedSims.length === 0) {
            return {
                totalSimulations: simulations.length,
                completedCount: 0,
                winRate: 0,
                totalPnlPercent: 0,
                averagePnlPercent: 0,
                bestTradePnl: 0,
                worstTradePnl: 0,
            };
        }

        const wins = completedSims.filter(s => s.result!.pnl > 0);
        
        const totalPnlPercent = completedSims.reduce((acc, sim) => acc + (sim.result!.pnl || 0), 0);
        const winRate = (wins.length / completedSims.length) * 100;
        const averagePnlPercent = totalPnlPercent / completedSims.length;

        const pnlValues = completedSims.map(s => s.result!.pnl || 0);
        const bestTradePnl = pnlValues.length > 0 ? Math.max(...pnlValues) : 0;
        const worstTradePnl = pnlValues.length > 0 ? Math.min(...pnlValues) : 0;

        return {
            totalSimulations: simulations.length,
            completedCount: completedSims.length,
            winRate,
            totalPnlPercent,
            averagePnlPercent,
            bestTradePnl,
            worstTradePnl,
        };
    }, [simulations]);

    return stats;
}