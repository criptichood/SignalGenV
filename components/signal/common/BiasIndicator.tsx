import React from 'react';

type Bias = 'Bullish' | 'Bearish' | 'Neutral';

export const BiasIndicator = ({ bias }: { bias: Bias }) => {
    const config: Record<Bias, { text: string; color: string }> = {
        Bullish: { text: 'Bullish', color: 'text-green-400' },
        Bearish: { text: 'Bearish', color: 'text-red-400' },
        Neutral: { text: 'Neutral', color: 'text-yellow-400' },
    };
    return <span className={config[bias].color}>{config[bias].text}</span>;
};