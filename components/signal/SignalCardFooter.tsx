import React from 'react';
import { Button } from '@/components/ui/Button';
import { Share2Icon } from '@/components/icons/Share2Icon';
import { ZapIcon } from '@/components/icons/ZapIcon';
import { CalculatorIcon } from '@/components/icons/CalculatorIcon';

interface SignalCardFooterProps {
    viewContext: 'generation' | 'history';
    isExpired: boolean;
    canExecute: boolean;
    onExplainClick: () => void;
    onForecastClick: () => void;
    onShareAsPost?: () => void;
    onExecuteClick: (type: 'market' | 'trailing') => void;
}

export const SignalCardFooter = ({
    viewContext,
    isExpired,
    canExecute,
    onExplainClick,
    onForecastClick,
    onShareAsPost,
    onExecuteClick
}: SignalCardFooterProps) => {
    if (viewContext !== 'generation') {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 pt-0">
           <div className="flex w-full gap-3">
                <Button 
                    onClick={onExplainClick}
                    className="w-full bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500/10 font-semibold text-base"
                    disabled={isExpired}
                >
                    Explain Signal
                </Button>
                <Button 
                    onClick={onForecastClick}
                    className="w-full bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500/10 font-semibold text-base"
                    disabled={isExpired}
                >
                    <CalculatorIcon className="w-4 h-4 mr-2" />
                    Forecast P/L
                </Button>
                {onShareAsPost && (
                    <Button 
                        onClick={onShareAsPost}
                        className="w-full bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500/10 font-semibold text-base"
                        disabled={true}
                    >
                        <Share2Icon className="w-4 h-4 mr-2" />
                        Share as Post
                    </Button>
                )}
           </div>
            {canExecute && (
                <>
                  <div className="w-full border-t border-gray-700 my-1"></div>
                  <div className="w-full flex gap-3">
                      <Button onClick={() => onExecuteClick('market')} className="flex-1">
                          <ZapIcon className="w-5 h-5 mr-2" />
                          Fast Execute
                      </Button>
                      <Button 
                        onClick={() => onExecuteClick('trailing')} 
                        className="flex-1 bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500/10 font-semibold"
                      >
                        Execute with Trailing SL
                      </Button>
                  </div>
                   <p className="text-xs text-gray-500 text-center">Execution is simulated. Orders are not sent to a live exchange.</p>
                </>
              )}
        </div>
    );
};