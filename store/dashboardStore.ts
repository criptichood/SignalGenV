import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WidgetId = 'quick-actions' | 'chart' | 'performance' | 'live-positions' | 'news' | 'history';

export interface DashboardWidget {
    id: WidgetId;
    name: string;
}

interface DashboardState {
    isEditMode: boolean;
    toggleEditMode: () => void;
    
    // All possible widgets
    availableWidgets: DashboardWidget[];
    
    // The widgets currently displayed on the dashboard, in order
    activeWidgets: WidgetId[];
    
    // Actions
    addWidget: (id: WidgetId) => void;
    removeWidget: (id: WidgetId) => void;
    moveWidget: (dragIndex: number, hoverIndex: number) => void;
}

const ALL_WIDGETS: DashboardWidget[] = [
    { id: 'quick-actions', name: 'Quick Actions' },
    { id: 'chart', name: 'BTC Price Chart' },
    { id: 'performance', name: 'Performance Snapshot' },
    { id: 'live-positions', name: 'Live Positions' },
    { id: 'news', name: 'AI News Feed' },
    { id: 'history', name: 'Recent AI Signals' },
];

const DEFAULT_LAYOUT: WidgetId[] = ['quick-actions', 'chart', 'performance', 'live-positions', 'news', 'history'];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      isEditMode: false,
      availableWidgets: ALL_WIDGETS,
      activeWidgets: DEFAULT_LAYOUT,
      
      toggleEditMode: () => set(state => ({ isEditMode: !state.isEditMode })),
      
      addWidget: (id) => set(state => {
        if (state.activeWidgets.includes(id)) return {}; // Avoid duplicates
        return { activeWidgets: [...state.activeWidgets, id] };
      }),
      
      removeWidget: (id) => set(state => ({
        activeWidgets: state.activeWidgets.filter(widgetId => widgetId !== id)
      })),
      
      moveWidget: (dragIndex, hoverIndex) => set(state => {
          const newWidgets = [...state.activeWidgets];
          const [draggedItem] = newWidgets.splice(dragIndex, 1);
          newWidgets.splice(hoverIndex, 0, draggedItem);
          return { activeWidgets: newWidgets };
      }),
    }),
    {
      name: 'dashboard-layout-storage',
      partialize: (state) => ({
          activeWidgets: state.activeWidgets,
      }),
    }
  )
);