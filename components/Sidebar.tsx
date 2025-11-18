import React, { useMemo } from 'react';
import type { Page, ChatIconType } from '@/types';
import { useStore } from '@/store';
import { useSocialStore } from '@/store/socialStore';
import {
    TrendingUp, Zap, Newspaper, History, TestTube2, BarChartBig, Calculator, Book, FileText, Shield, Layers, User,
    Bot, Settings, Sparkles, Lightbulb, MessageSquare, Compass, Mail, Home, ScanLine, LogOut, Pencil, Flame
} from 'lucide-react';


interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  page: Page;
  currentPage: Page;
  onClick: (page: Page) => void;
  badgeCount?: number;
  "data-tour-id"?: string;
}

const NavLink = ({ icon, label, page, currentPage, onClick, badgeCount, ...props }: NavLinkProps) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => onClick(page)}
      className={`relative flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-cyan-500/20 text-cyan-300'
          : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
      }`}
      {...props}
    >
      <span className="mr-3">{icon}</span>
      {label}
      {badgeCount && badgeCount > 0 && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </button>
  );
};

const ChatIcon = ({ icon, className }: { icon: ChatIconType; className: string }) => {
    switch (icon) {
        case 'sparkles': return <Sparkles className={className} />;
        case 'lightbulb': return <Lightbulb className={className} />;
        case 'message': return <MessageSquare className={className} />;
        case 'bot':
        default:
            return <Bot className={className} />;
    }
};


export const Sidebar = () => {
    const { 
        currentPage, setCurrentPage, isSidebarOpen, setIsSidebarOpen,
        setIsChatOpen, chatIcon, logout
    } = useStore();
    const { conversations, users, setViewingProfileUsername } = useSocialStore();
    const currentUser = useMemo(() => users?.find(u => u.username === 'CryptoTrader123'), [users]);
    
    const unreadMessagesCount = useMemo(() => {
        if (!currentUser) return 0;
        return conversations.reduce((count, convo) => {
            if (convo.participantUsernames.includes(currentUser.username)) {
                return count + convo.messages.filter(m => m.senderUsername !== currentUser.username && !m.isRead).length;
            }
            return count;
        }, 0);
    }, [conversations, currentUser]);
    
    const handleNavigation = (page: Page) => {
        if (page === 'profile') {
            setViewingProfileUsername(null);
        }
        setCurrentPage(page);
        if (window.innerWidth < 1024) { // Close sidebar on mobile after navigation
            setIsSidebarOpen(false);
        }
    };
    
    const handleOpenChat = () => {
        setIsChatOpen(true);
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

  return (
    <>
        {/* Overlay for mobile */}
        <div 
            className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsSidebarOpen(false)}
        ></div>

        <aside data-tour-id="sidebar" className={`bg-gray-800 border-r border-gray-700 w-64 flex-shrink-0 transform transition-transform duration-300 ease-in-out z-40 fixed inset-y-0 left-0 flex flex-col lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-center h-16 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-cyan-400" />
                    <h1 className="text-xl font-bold text-white tracking-wider">
                        Signal <span className="text-cyan-400">Gen</span>
                    </h1>
                </div>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                <h3 className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Analysis</h3>
                <NavLink icon={<Home className="w-5 h-5" />} label="Dashboard" page="dashboard" currentPage={currentPage} onClick={handleNavigation} />
                <NavLink data-tour-id="sidebar-signal-gen-link" icon={<TrendingUp className="w-5 h-5" />} label="Signal Gen" page="signal-gen" currentPage={currentPage} onClick={handleNavigation} />
                <NavLink icon={<Zap className="w-5 h-5" />} label="Scalping" page="scalping" currentPage={currentPage} onClick={handleNavigation} />
                <NavLink icon={<Flame className="w-5 h-5" />} label="Memes Scalp" page="memes-scalp" currentPage={currentPage} onClick={handleNavigation} />
                <NavLink icon={<Pencil className="w-5 h-5" />} label="Man Signal" page="manual-studio" currentPage={currentPage} onClick={handleNavigation} />
                <NavLink icon={<ScanLine className="w-5 h-5" />} label="Screener" page="screener" currentPage={currentPage} onClick={handleNavigation} />
                <NavLink icon={<Newspaper className="w-5 h-5" />} label="News" page="news" currentPage={currentPage} onClick={handleNavigation} />
                <NavLink icon={<History className="w-5 h-5" />} label="AI Signal History" page="history" currentPage={currentPage} onClick={handleNavigation} />
                <NavLink icon={<TestTube2 className="w-5 h-5" />} label="Simulation" page="simulation" currentPage={currentPage} onClick={handleNavigation} />
                
                 <div className="pt-2">
                    <h3 className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assistant</h3>
                     <button
                        onClick={handleOpenChat}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                    >
                        <ChatIcon icon={chatIcon} className="w-5 h-5 mr-3" />
                        AI Assistant
                    </button>
                </div>
                
                <div className="pt-2">
                    <h3 className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Logs</h3>
                    <NavLink icon={<FileText className="w-5 h-5" />} label="Spot Log" page="spot-log" currentPage={currentPage} onClick={handleNavigation} />
                    <NavLink icon={<FileText className="w-5 h-5" />} label="Perp Log" page="perp-log" currentPage={currentPage} onClick={handleNavigation} />
                </div>
                
                <div className="pt-2">
                    <h3 className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Social</h3>
                    <NavLink icon={<Compass className="w-5 h-5" />} label="Discover" page="discover" currentPage={currentPage} onClick={handleNavigation} />
                    <NavLink icon={<Mail className="w-5 h-5" />} label="Messages" page="messages" currentPage={currentPage} onClick={handleNavigation} badgeCount={unreadMessagesCount}/>
                    <NavLink icon={<Layers className="w-5 h-5" />} label="Strategies" page="strategies" currentPage={currentPage} onClick={handleNavigation} />
                    <NavLink icon={<User className="w-5 h-5" />} label="Profile" page="profile" currentPage={currentPage} onClick={handleNavigation} />
                </div>

                <div className="pt-2">
                    <h3 className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</h3>
                    <NavLink icon={<BarChartBig className="w-5 h-5" />} label="Analytics" page="analytics" currentPage={currentPage} onClick={handleNavigation} />
                    <NavLink icon={<Calculator className="w-5 h-5" />} label="Calculator" page="calculator" currentPage={currentPage} onClick={handleNavigation} />
                    <NavLink icon={<Shield className="w-5 h-5" />} label="Stablecoin Stash" page="stablecoin-stash" currentPage={currentPage} onClick={handleNavigation} />
                    <NavLink icon={<Book className="w-5 h-5" />} label="Tutorials" page="tutorials" currentPage={currentPage} onClick={handleNavigation} />
                </div>

                <div className="pt-2">
                    <h3 className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">System</h3>
                    <NavLink icon={<Settings className="w-5 h-5" />} label="Settings" page="settings" currentPage={currentPage} onClick={handleNavigation} />
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </nav>
        </aside>
    </>
  );
};