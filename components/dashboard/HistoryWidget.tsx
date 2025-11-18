import React from 'react';
import { useStore } from '@/store';
import { useHistoryStore } from '@/store/historyStore';
import { HistoryTable } from '@/components/HistoryTable';

export const HistoryWidget = () => {
    const { setCurrentPage } = useStore();
    const { signalHistory, setSignalHistory } = useHistoryStore();

    return (
         <HistoryTable
            data={signalHistory}
            isDashboardView={true}
            onDelete={(id) => setSignalHistory(prev => prev.filter(s => s.id !== id))}
            onUpdateStatus={(id, status) => setSignalHistory(prev => prev.map(s => (s.id === id ? { ...s, status } : s)))}
            onViewDetails={() => {}} // Modal view is handled on the full history page
            onViewAll={() => setCurrentPage('history')}
        />
    );
};