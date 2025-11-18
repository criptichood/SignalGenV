import React from 'react';
import { useStore } from '@/store';
import { AnalyticsIcon } from '@/components/icons/AnalyticsIcon';
import { ChartIcon } from '@/components/icons/ChartIcon';
import { ScanLineIcon } from '@/components/icons/ScanLineIcon';
import { ZapIcon } from '@/components/icons/ZapIcon';

const QuickActionCard = ({ icon, title, description, onClick }: { icon: React.ReactNode; title: string; description: string; onClick: () => void; }) => (
    <button
        onClick={onClick}
        className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg text-left border border-gray-700/50 hover:border-cyan-400/50 hover:-translate-y-1 transition-all duration-200 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
    >
        <div className="bg-cyan-500/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4 border border-cyan-500/20">
            {icon}
        </div>
        <h3 className="font-bold text-white text-lg">{title}</h3>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
    </button>
);

export const QuickActionsWidget = () => {
    const { setCurrentPage } = useStore();
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard 
                icon={<ChartIcon className="w-6 h-6 text-cyan-400" />}
                title="Generate Signal"
                description="AI analysis for swing trades on higher timeframes."
                onClick={() => setCurrentPage('signal-gen')}
            />
            <QuickActionCard 
                icon={<ZapIcon className="w-6 h-6 text-cyan-400" />}
                title="Start Scalping"
                description="High-frequency tools for short-term opportunities."
                onClick={() => setCurrentPage('scalping')}
            />
             <QuickActionCard 
                icon={<ScanLineIcon className="w-6 h-6 text-cyan-400" />}
                title="Run Screener"
                description="Find assets matching your custom criteria with AI."
                onClick={() => setCurrentPage('screener')}
            />
             <QuickActionCard 
                icon={<AnalyticsIcon className="w-6 h-6 text-cyan-400" />}
                title="View Analytics"
                description="Review your overall trading performance."
                onClick={() => setCurrentPage('analytics')}
            />
        </div>
    );
};