import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatConversation } from '@/types';

interface ChatState {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  setConversations: (updater: (prev: ChatConversation[]) => ChatConversation[]) => void;
  setCurrentConversationId: (id: string | null) => void;
  clearAllConversations: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      conversations: [],
      currentConversationId: null,
      setConversations: (updater) => set(state => ({ conversations: updater(state.conversations) })),
      setCurrentConversationId: (id) => set({ currentConversationId: id }),
      clearAllConversations: () => set({ conversations: [], currentConversationId: null }),
    }),
    {
      name: 'chatHistory',
      partialize: (state) => ({ conversations: state.conversations }),
    }
  )
);