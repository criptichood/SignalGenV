import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { TestTube2 } from 'lucide-react';

export const SimulationEmptyState = () => (
  <Card className="min-h-[400px] border-dashed border-gray-600 bg-gray-800/50">
     <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <TestTube2 className="w-16 h-16 text-gray-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-300">Simulation Playback</h3>
        <p className="text-gray-500 mt-1 max-w-sm">
            Start a simulation from the history table below, or create a new manual setup to see it run here.
        </p>
    </CardContent>
  </Card>
);