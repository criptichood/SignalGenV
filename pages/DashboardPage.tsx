import React, { useRef } from 'react';
import { useDashboardStore, WidgetId } from '@/store/dashboardStore';
import { AddWidgetDropdown } from '@/components/dashboard/AddWidgetDropdown';
import { WidgetWrapper } from '@/components/dashboard/WidgetWrapper';
import { QuickActionsWidget } from '@/components/dashboard/QuickActionsWidget';
import { ChartWidget } from '@/components/dashboard/ChartWidget';
import { PerformanceSnapshotWidget } from '@/components/dashboard/PerformanceSnapshotWidget';
import { LivePositionsWidget } from '@/components/dashboard/LivePositionsWidget';
import { NewsWidget } from '@/components/dashboard/NewsWidget';
import { HistoryWidget } from '@/components/dashboard/HistoryWidget';
import { Button } from '@/components/ui/Button';
import { Layout } from 'lucide-react';

const WIDGET_MAP: Record<WidgetId, React.FC> = {
    'quick-actions': QuickActionsWidget,
    'chart': ChartWidget,
    'performance': PerformanceSnapshotWidget,
    'live-positions': LivePositionsWidget,
    'news': NewsWidget,
    'history': HistoryWidget,
};

const DashboardPage = () => {
    const { isEditMode, toggleEditMode, activeWidgets, availableWidgets, moveWidget } = useDashboardStore();
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    
    const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragItem.current = index;
    };

    const onDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragOverItem.current = index;
    };
    
    const onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
            moveWidget(dragItem.current, dragOverItem.current);
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };

    const getWidgetComponent = (widgetId: WidgetId) => {
        return WIDGET_MAP[widgetId] || null;
    };

    return (
        <div className="space-y-8">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Mission Control</h1>
                    <p className="text-gray-400 mt-1">Your unified dashboard for market analysis and activity.</p>
                </div>
                <div className="flex items-center gap-4">
                    {isEditMode && <AddWidgetDropdown />}
                    <Button variant="outline" onClick={toggleEditMode}>
                        <Layout className="w-4 h-4 mr-2" />
                        {isEditMode ? 'Save Layout' : 'Edit Layout'}
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {activeWidgets.map((widgetId, index) => {
                    const WidgetComponent = getWidgetComponent(widgetId);
                    const widgetInfo = availableWidgets.find(w => w.id === widgetId);

                    if (!WidgetComponent || !widgetInfo) return null;
                    
                    return (
                        <div key={widgetId} onDragEnter={(e) => onDragEnter(e, index)} onDragEnd={onDragEnd}>
                             <WidgetWrapper
                                widgetId={widgetId}
                                widgetName={widgetInfo.name}
                                onDragStart={(e) => onDragStart(e, index)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={onDragEnd}
                             >
                                <WidgetComponent />
                            </WidgetWrapper>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardPage;