import React from 'react';
import type { Page } from '@/types';
import { TrendingUp, Menu } from 'lucide-react';
import { NotificationBell } from '@/components/header/NotificationBell';
import { useStore } from '@/store';
import { useSocialStore } from '@/store/socialStore';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { setCurrentPage } = useStore();
  const { notifications, users, setActiveConversationId, handleMarkNotificationsAsRead } = useSocialStore();

  const handleNavigate = (page: Page, relatedId?: string) => {
    setCurrentPage(page);
    if (page === 'messages' && relatedId) {
        setActiveConversationId(relatedId);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 shadow-lg">
      <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-full lg:hidden hover:bg-gray-700 transition-colors duration-200"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6 text-gray-300" />
          </button>
          <div className="hidden lg:flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-cyan-400" />
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">
              Signal <span className="text-cyan-400">Gen</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
            <NotificationBell 
                notifications={notifications}
                onNavigate={handleNavigate}
                onMarkAsRead={handleMarkNotificationsAsRead}
                users={users}
            />
        </div>

      </div>
    </header>
  );
};