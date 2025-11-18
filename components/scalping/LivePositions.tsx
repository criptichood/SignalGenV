import React from 'react';
import type { LivePosition } from '@/types';
import { LivePositionCard } from './LivePositionCard';

interface LivePositionsProps {
  livePositions: LivePosition[];
  livePrice: number | null;
  onManualClose: (position: LivePosition) => void;
  onModifyPosition: (positionId: string, newTp?: number, newSl?: number) => Promise<void>;
}

export const LivePositions = ({ livePositions, livePrice, onManualClose, onModifyPosition }: LivePositionsProps) => {
  if (livePositions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mt-6">
      <h2 className="text-xl font-semibold text-white">Live Positions</h2>
      {livePositions.map(pos => (
        <LivePositionCard
          key={pos.id}
          position={pos}
          livePrice={livePrice}
          onClose={onManualClose}
          onModify={onModifyPosition}
        />
      ))}
    </div>
  );
};
