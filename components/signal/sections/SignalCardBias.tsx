import React from 'react';
import type { Signal } from '@/types';
import { BiasIndicator } from '../common/BiasIndicator';

interface SignalCardBiasProps {
    biasSummary: Signal['biasSummary'];
}

export const SignalCardBias = ({ biasSummary }: SignalCardBiasProps) => {
    if (!biasSummary) return null;

    return (
        <div>
            <h4 className="text-base font-semibold text-gray-300 uppercase tracking-wider mb-2">Multi-Timeframe Bias</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                    <p className="text-xs text-gray-500 font-bold">SHORT-TERM</p>
                    <p className="text-lg font-semibold"><BiasIndicator bias={biasSummary.shortTerm} /></p>
                </div>
                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                    <p className="text-xs text-gray-500 font-bold">MID-TERM</p>
                    <p className="text-lg font-semibold"><BiasIndicator bias={biasSummary.midTerm} /></p>
                </div>
                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                    <p className="text-xs text-gray-500 font-bold">LONG-TERM</p>
                    <p className="text-lg font-semibold"><BiasIndicator bias={biasSummary.longTerm} /></p>
                </div>
            </div>
        </div>
    );
};