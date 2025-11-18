import React from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { GripVerticalIcon } from '@/components/icons/GripVerticalIcon';
import { X } from 'lucide-react';

interface WidgetWrapperProps {
    widgetId: string;
    widgetName: string;
    children: React.ReactNode;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ widgetId, widgetName, children, onDragStart, onDragOver, onDrop }) => {
    const { isEditMode, removeWidget } = useDashboardStore();

    return (
        <div 
            className={`relative group transition-all duration-200 ${isEditMode ? 'ring-2 ring-dashed ring-cyan-500/50 p-2 rounded-xl' : ''}`}
            draggable={isEditMode}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            {isEditMode && (
                <div 
                    className="absolute top-2 left-2 z-10 flex items-center gap-2 p-1 bg-gray-900/80 backdrop-blur-sm rounded-md border border-gray-700"
                >
                    <div className="cursor-move p-1 text-gray-500" title="Drag to reorder">
                        <GripVerticalIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-300 select-none pr-2">{widgetName}</h3>
                    <button 
                        onClick={() => removeWidget(widgetId as any)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                        title="Remove Widget"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            {children}
        </div>
    );
};