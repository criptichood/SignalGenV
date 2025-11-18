import React, { useMemo } from 'react';
import { useScalpingStore } from '@/store/scalpingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export const LivePositionsWidget = () => {
    const { livePositions } = useScalpingStore();

    // The widget returns null if there are no positions, so it won't render on the dashboard.
    if (livePositions.length === 0) {
        return null;
    }

    const livePositionsWithPnl = useMemo(() => {
        // Mock PNL calculation since we don't have live price for all symbols here.
        // The full P/L is visible on the Scalping page.
        return livePositions.map(pos => ({ ...pos, pnl: 0 }));
    }, [livePositions]);
    
    return (
        <Card>
             <CardHeader>
                <CardTitle>Live Positions</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {livePositionsWithPnl.map(pos => (
                        <li key={pos.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <span className={`font-bold ${pos.side === 'Long' ? 'text-green-400' : 'text-red-400'}`}>
                                    {pos.side.toUpperCase()}
                                </span>
                                <span className="text-white">{pos.symbol}</span>
                            </div>
                             <span className={`font-mono text-gray-400`}>
                                (P/L not available here)
                            </span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};