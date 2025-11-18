import React, { useCallback, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import SignalGenPage from '@/pages/SignalGenPage';
import ScalpingPage from '@/pages/ScalpingPage';
import MemesScalpPage from '@/pages/MemesScalpPage';
import ScreenerPage from '@/pages/ScreenerPage';
import NewsPage from '@/pages/NewsPage';
import HistoryPage from '@/pages/HistoryPage';
import SimulationPage from '@/pages/SimulationPage';
import SpotLogPage from '@/pages/SpotLogPage';
import PerpLogPage from '@/pages/PerpLogPage';
import TutorialsPage from '@/pages/TutorialsPage';
import CalculatorPage from '@/pages/CalculatorPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import StablecoinStashPage from '@/pages/StablecoinStashPage';
import StrategyPage from '@/pages/StrategyPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import DiscoverPage from '@/pages/DiscoverPage';
import MessagesPage from '@/pages/MessagesPage';
import DashboardPage from '@/pages/DashboardPage';
import AuthPage from '@/pages/AuthPage';
import ManualStudioPage from '@/pages/ManualStudioPage';
import type { Page, UserParams, Signal, UserPost, Strategy, DirectMessage, Notification, PageContext, UserProfile } from '@/types';
import { useStore } from '@/store';
import { useSocialStore } from '@/store/socialStore';
import { useScreenerStore } from '@/store/screenerStore';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { useChat } from '@/hooks/useChat';
import { useSignalGenerator } from '@/hooks/useSignalGenerator';
import { Toast } from '@/components/ui/Toast';
import { SharePostModal } from '@/components/messages/SharePostModal';
import { ViewPostModal } from '@/components/profile/ViewPostModal';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { sessionManager } from '@/utils/sessionManager';

export default function App() {
  const {
    // State
    isAuthenticated,
    bybitApiKey, bybitApiSecret, currentPage, isSidebarOpen,
    theme, audioAlertsEnabled, contextualChatEnabled,
    functionCallingEnabled, chatIcon, isChatOpen, toast,
    isTourActive, isTourCompleted,

    // Actions
    login,
    setCurrentPage, setIsSidebarOpen,
    setIsChatOpen, setToast, startTour
  } = useStore();

  const {
    users, posts,
    setConversations, setNotifications, setPostToView, setPostToShare,
    setViewingProfileUsername,
    postToShare, postToView,
    handleCreateStrategy, handleCreatePost,
    handleSharePost, handleShareSignalAsPost,
  } = useSocialStore();

  const { pruneOldScans } = useScreenerStore();

  // Use the authenticated user from the store instead of mock user
  const { user } = useStore();
  const currentUser = useMemo(() => {
    // If we have an authenticated user from Supabase, create a basic profile
    if (user) {
      return {
        username: user.user_metadata?.user_name || user.email?.split('@')[0] || user.id,
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        bio: user.user_metadata?.bio || 'AI Trading Enthusiast',
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined,
        joinedAt: user.created_at ? new Date(user.created_at).getTime() : Date.now(),
        followers: [],
        following: [],
        isVerified: false,
      };
    }
    // Fallback to mock user if no authenticated user
    return users?.find(u => u.username === 'CryptoTrader123') || null;
  }, [user, users]);

  // Initialize session on app load
  useEffect(() => {
    sessionManager.initializeSession();
  }, []); // Empty dependency array to run only once

  // Apply theme changes to the DOM
  useEffect(() => {
    const themeName = `${theme.mode}-${theme.accent}`;
    document.documentElement.dataset.theme = themeName;
  }, [theme]);

  // Prune old screener runs on initial app load
  useEffect(() => {
    pruneOldScans();
  }, [pruneOldScans]);

  // Start tour on first visit after login
  useEffect(() => {
    const timer = setTimeout(() => {
        if (!isTourCompleted && isAuthenticated) {
            startTour();
        }
    }, 1500); // Small delay to let the UI settle
    return () => clearTimeout(timer);
  }, [isTourCompleted, isAuthenticated, startTour]);

  // Simulate receiving a message for notification demo
  useEffect(() => {
    const hasReceivedMockMessage = localStorage.getItem('hasReceivedMockMessage');
    if (!hasReceivedMockMessage) {
        const timer = setTimeout(() => {
            const newMessage: DirectMessage = {
                id: crypto.randomUUID(),
                senderUsername: 'JaneTrader',
                content: 'Hey! Saw your last BTC trade, nice analysis. What do you think about the SOL chart right now?',
                timestamp: Date.now(),
                isRead: false,
            };

            let convoId = '';
            setConversations(prev => {
                return prev.map(convo => {
                    if (convo.participantUsernames.includes('JaneTrader')) {
                        convoId = convo.id;
                        return { ...convo, messages: [...convo.messages, newMessage] };
                    }
                    return convo;
                });
            });

            const newNotification: Notification = {
                id: crypto.randomUUID(),
                type: 'new_message',
                fromUsername: 'JaneTrader',
                relatedEntityId: convoId,
                timestamp: Date.now(),
                isRead: false,
            };
            setNotifications(prev => [newNotification, ...prev]);
            setToast({ message: "New message from @JaneTrader", variant: 'success' });

            localStorage.setItem('hasReceivedMockMessage', 'true');
        }, 5000); // 5 seconds after app load

        return () => clearTimeout(timer);
    }
  }, [setConversations, setNotifications, setToast]); // Run only once

  // Hash-based routing for posts
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#\/posts\/([a-zA-Z0-9-]+)$/);
      if (match) {
        const postId = match[1];
        const post = posts.find(p => p.id === postId);
        if (post) {
          setPostToView(post);
        } else {
          setToast({ message: "Post not found.", variant: 'error' });
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check hash on initial load

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [posts, setPostToView, setToast]);

  const handleNavigateToProfile = (username: string) => {
      if (currentUser && username === currentUser.username) {
          setViewingProfileUsername(null);
          setCurrentPage('profile');
      } else {
          setViewingProfileUsername(username);
          setCurrentPage('view-profile');
      }
  };

  const signalGenerator = useSignalGenerator(setCurrentPage, audioAlertsEnabled);

  const signalGenState = signalGenerator.signalGenController.generationState;
  const scalpState = signalGenerator.scalpController.generationState;

  const pageContext: PageContext = {
    page: currentPage,
    symbol: currentPage === 'signal-gen' ? signalGenState.currentParams?.symbol : currentPage === 'scalping' ? scalpState.currentParams?.symbol : undefined,
    timeframe: currentPage === 'signal-gen' ? signalGenState.currentParams?.timeframe : currentPage === 'scalping' ? scalpState.currentParams?.timeframe : undefined,
    model: currentPage === 'signal-gen' ? signalGenState.currentParams?.model : currentPage === 'scalping' ? scalpState.currentParams?.model : undefined,
    contextualChatEnabled,
    functionCallingEnabled,
    signal: currentPage === 'signal-gen' ? signalGenState.signal : currentPage === 'scalping' ? scalpState.signal : null,
    params: currentPage === 'signal-gen' ? signalGenState.currentParams : currentPage === 'scalping' ? scalpState.currentParams : null,
  };

  const chatController = useChat(
    pageContext,
    signalGenerator.triggerSignalGeneration,
    signalGenerator.triggerScalpGeneration,
    handleCreateStrategy,
    handleCreatePost,
    setToast
  );

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={login} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'signal-gen':
        return (
          <SignalGenPage
            bybitApiKey={bybitApiKey}
            bybitApiSecret={bybitApiSecret}
            controller={signalGenerator.signalGenController}
            onShareSignalAsPost={(signal) => handleShareSignalAsPost(signal, setCurrentPage)}
          />
        );
      case 'manual-studio':
        return <ManualStudioPage />;
      case 'scalping':
        return (
          <ScalpingPage
            bybitApiKey={bybitApiKey}
            bybitApiSecret={bybitApiSecret}
            controller={signalGenerator.scalpController}
            onShareSignalAsPost={(signal) => handleShareSignalAsPost(signal, setCurrentPage)}
          />
        );
      case 'memes-scalp':
        return <MemesScalpPage />;
      case 'screener':
        return <ScreenerPage
            onGenerateSignal={signalGenerator.triggerSignalGeneration}
            onGenerateScalp={signalGenerator.triggerScalpGeneration}
        />;
      case 'discover':
        return <DiscoverPage onNavigateToProfile={handleNavigateToProfile} />;
      case 'messages':
        return <MessagesPage onNavigateToProfile={handleNavigateToProfile} />;
      case 'profile':
        return <ProfilePage onNavigateToProfile={handleNavigateToProfile} />;
      case 'view-profile':
        return <ProfilePage onNavigateToProfile={handleNavigateToProfile} />;
      case 'news':
        return <NewsPage />;
      case 'history':
        return <HistoryPage />;
      case 'spot-log':
        return <SpotLogPage />;
      case 'perp-log':
        return <PerpLogPage />;
      case 'simulation':
        return <SimulationPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'calculator':
        return <CalculatorPage />;
      case 'stablecoin-stash':
        return <StablecoinStashPage />;
      case 'strategies':
        return <StrategyPage />;
      case 'tutorials':
        return <TutorialsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="relative flex min-h-screen bg-black text-gray-100 font-sans">
      {isTourActive && <OnboardingTour />}
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {renderPage()}
        </main>
      </div>

      {currentUser && (
        <ChatWidget
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            onOpen={() => setIsChatOpen(true)}
            context={pageContext}
            chatController={chatController}
            chatIcon={chatIcon}
            currentUser={currentUser}
            onNavigate={setCurrentPage}
        />
      )}

      <SharePostModal
        isOpen={!!postToShare}
        onClose={() => setPostToShare(null)}
        onSelectUser={(username) => handleSharePost(username, setCurrentPage)}
      />
       <ViewPostModal
        post={postToView}
        onClose={() => {
          setPostToView(null);
          window.history.pushState("", document.title, window.location.pathname + window.location.search);
        }}
        onNavigateToProfile={handleNavigateToProfile}
      />
    </div>
  );
}