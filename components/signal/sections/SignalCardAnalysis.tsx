import React, { useState } from 'react';
import { SparklesIcon } from '@/components/icons/SparklesIcon';
import { CopyIcon } from '@/components/icons/CopyIcon';
import { CheckIcon } from '@/components/icons/CheckIcon';
import { FormattedReasoning } from '@/components/FormattedReasoning';

interface SignalCardAnalysisProps {
    reasoning: string;
}

export const SignalCardAnalysis = ({ reasoning }: SignalCardAnalysisProps) => {
    const [isReasoningCopied, setIsReasoningCopied] = useState(false);

    const handleCopyReasoning = () => {
        navigator.clipboard.writeText(reasoning);
        setIsReasoningCopied(true);
        setTimeout(() => setIsReasoningCopied(false), 2000);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-base font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-yellow-400"/> AI Analysis
                </h4>
                <button 
                    onClick={handleCopyReasoning} 
                    className="p-1.5 rounded-md text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors"
                    aria-label="Copy reasoning"
                >
                    {isReasoningCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                </button>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 max-h-48 overflow-y-auto">
                <FormattedReasoning text={reasoning} />
            </div>
        </div>
    );
};