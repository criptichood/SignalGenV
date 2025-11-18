import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';

const mantras = [
  "Analyzing market structure...",
  "Identifying liquidity zones...",
  "Calculating risk/reward scenarios...",
  "Checking multi-timeframe confluence...",
  "Finalizing predictive analysis...",
];

export const LoadingState = () => {
  const [currentMantraIndex, setCurrentMantraIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMantraIndex(prevIndex => (prevIndex + 1) % mantras.length);
    }, 3000); // Change mantra every 3 seconds to match animation

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center h-[284px] text-center">
        <div className="relative w-16 h-16 animate-scanner-spin">
          {/* Inner Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-xl text-cyan-400/80 select-none">SG</span>
          </div>

          {/* Outer arcs */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-full"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-full"></div>
          
          {/* Inner counter-rotating arcs */}
          <div className="absolute inset-0 animate-scanner-spin-reverse">
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-cyan-400/70 rounded-tr-full"></div>
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-cyan-400/70 rounded-bl-full"></div>
          </div>
        </div>
        
        <p className="mt-4 text-lg font-semibold text-gray-300">AI is analyzing market data...</p>
        <div className="mt-2 min-h-[24px]">
          <p key={currentMantraIndex} className="text-gray-400 animate-fade-in-out">
            {mantras[currentMantraIndex]}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
