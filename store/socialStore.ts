import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, UserPost, Strategy, DirectMessageConversation, DirectMessage, Notification, Comment, SavedSignal, Page, TradeIdea, AIFeedback } from '@/types';
import { MOCK_USERS, MOCK_POSTS, MOCK_STRATEGIES, MOCK_CONVERSATIONS, MOCK_NOTIFICATIONS } from '@/data/mockData';

// Helper functions for comment manipulation
const updateCommentRecursively = (comments: Comment[], targetId: string, updateFn: (comment: Comment) => Comment): Comment[] => {
  return comments.map(comment => {
    if (comment.id === targetId) {
      return updateFn(comment);
    }
    if (comment.replies && comment.replies.length > 0) {
      return { ...comment, replies: updateCommentRecursively(comment.replies, targetId, updateFn) };
    }
    return comment;
  });
};

const addReplyRecursively = (comments: Comment[], parentId: string, newReply: Comment): Comment[] => {
    return comments.map(comment => {
        if (comment.id === parentId) {
            const replies = comment.replies ? [...comment.replies, newReply] : [newReply];
            return { ...comment, replies };
        }
        if (comment.replies && comment.replies.length > 0) {
            return { ...comment, replies: addReplyRecursively(comment.replies, parentId, newReply) };
        }
        return comment;
    });
};


interface SocialState {
  // Data
  users: UserProfile[];
  posts: UserPost[];
  strategies: Strategy[];
  conversations: DirectMessageConversation[];
  notifications: Notification[];
  setUsers: (updater: UserProfile[] | ((prev: UserProfile[]) => UserProfile[])) => void;
  setPosts: (updater: UserPost[] | ((prev: UserPost[]) => UserPost[])) => void;
  setStrategies: (updater: Strategy[] | ((prev: Strategy[]) => Strategy[])) => void;
  setConversations: (updater: DirectMessageConversation[] | ((prev: DirectMessageConversation[]) => DirectMessageConversation[])) => void;
  setNotifications: (updater: Notification[] | ((prev: Notification[]) => Notification[])) => void;
  
  // UI State
  viewingProfileUsername: string | null;
  activeConversationId: string | null;
  postToShare: UserPost | null;
  postToView: UserPost | null;
  pendingMessage: { conversationId: string; content: string } | null;
  signalToAttach: SavedSignal | null;
  tradeIdeaToAttach: { userIdea: TradeIdea; aiFeedback?: AIFeedback } | null;
  setViewingProfileUsername: (username: string | null) => void;
  setActiveConversationId: (id: string | null) => void;
  setPostToShare: (post: UserPost | null) => void;
  setPostToView: (post: UserPost | null) => void;
  setPendingMessage: (msg: { conversationId: string; content: string } | null) => void;
  setSignalToAttach: (signal: SavedSignal | null) => void;
  setTradeIdeaToAttach: (idea: SocialState['tradeIdeaToAttach']) => void;
  
  // Actions
  handleFollow: (usernameToFollow: string) => void;
  handleUnfollow: (usernameToUnfollow: string) => void;
  handleSaveProfile: (updatedProfile: UserProfile) => void;
  handleCreateStrategy: (strategyData: Omit<Strategy, 'id' | 'createdAt' | 'authorUsername'>) => void;
  handleCreatePost: (postData: Omit<UserPost, 'id' | 'createdAt' | 'likedBy' | 'commentCount' | 'comments' | 'author' | 'repostedBy' | 'attachedSignalId' | 'attachedTradeIdea'>) => void;
  handleDeletePost: (postToDelete: UserPost) => void;
  handleLikePost: (postToLike: UserPost) => void;
  handleRepost: (postToRepost: UserPost) => void;
  handleUndoRepost: (originalPost: UserPost) => void;
  handleAddComment: (postId: string, content: string, parentId?: string) => void;
  handleLikeComment: (postId: string, commentId: string) => void;
  findOrCreateConversation: (username: string) => DirectMessageConversation;
  handleSendMessage: (receiverUsername: string, content: string) => void;
  handleOpenMessage: (username: string, setPage: (page: any) => void) => void; // Needs page setter
  handleMarkNotificationsAsRead: (ids: string[]) => void;
  handleSharePost: (receiverUsername: string, setPage: (page: any) => void) => void; // Needs page setter
  handleShareSignalAsPost: (signal: SavedSignal, setPage: (page: Page) => void) => void;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      // --- STATE & SETTERS ---
      users: MOCK_USERS,
      posts: MOCK_POSTS,
      strategies: MOCK_STRATEGIES,
      conversations: MOCK_CONVERSATIONS,
      notifications: MOCK_NOTIFICATIONS,
      viewingProfileUsername: null,
      activeConversationId: null,
      postToShare: null,
      postToView: null,
      pendingMessage: null,
      signalToAttach: null,
      tradeIdeaToAttach: null,

      setUsers: (updater) => set(state => ({ users: typeof updater === 'function' ? updater(state.users) : updater })),
      setPosts: (updater) => set(state => ({ posts: typeof updater === 'function' ? updater(state.posts) : updater })),
      setStrategies: (updater) => set(state => ({ strategies: typeof updater === 'function' ? updater(state.strategies) : updater })),
      setConversations: (updater) => set(state => ({ conversations: typeof updater === 'function' ? updater(state.conversations) : updater })),
      setNotifications: (updater) => set(state => ({ notifications: typeof updater === 'function' ? updater(state.notifications) : updater })),
      
      setViewingProfileUsername: (username) => set({ viewingProfileUsername: username }),
      setActiveConversationId: (id) => set({ activeConversationId: id }),
      setPostToShare: (post) => set({ postToShare: post }),
      setPostToView: (post) => set({ postToView: post }),
      setPendingMessage: (msg) => set({ pendingMessage: msg }),
      setSignalToAttach: (signal) => set({ signalToAttach: signal }),
      setTradeIdeaToAttach: (idea) => set({ tradeIdeaToAttach: idea }),

      // --- ACTIONS ---
      handleFollow: (usernameToFollow) => {
        const { users } = get();
        const currentUser = users?.find(u => u.username === 'CryptoTrader123');
        if (!currentUser) return;
        set(state => ({
          users: state.users.map(user => {
            if (user.username === currentUser.username) return { ...user, following: [...user.following, usernameToFollow] };
            if (user.username === usernameToFollow) return { ...user, followers: [...user.followers, currentUser.username] };
            return user;
          })
        }));
      },
      handleUnfollow: (usernameToUnfollow) => {
        const { users } = get();
        const currentUser = users?.find(u => u.username === 'CryptoTrader123');
        if (!currentUser) return;
        set(state => ({
          users: state.users.map(user => {
            if (user.username === currentUser.username) return { ...user, following: user.following.filter(u => u !== usernameToUnfollow) };
            if (user.username === usernameToUnfollow) return { ...user, followers: user.followers.filter(u => u !== currentUser.username) };
            return user;
          })
        }));
      },
      handleSaveProfile: (updatedProfile) => {
        set(state => ({ users: state.users.map(u => u.username === updatedProfile.username ? updatedProfile : u) }));
      },
      handleCreateStrategy: (strategyData) => {
        const { users } = get();
        const currentUser = users?.find(u => u.username === 'CryptoTrader123');
        if (!currentUser) return;
        const newStrategy: Strategy = { ...strategyData, id: crypto.randomUUID(), authorUsername: currentUser.username, createdAt: Date.now() };
        set(state => ({ strategies: [newStrategy, ...state.strategies] }));
      },
      handleCreatePost: (postData) => {
        const { users, signalToAttach, tradeIdeaToAttach } = get();
        const currentUser = users?.find(u => u.username === 'CryptoTrader123');
        if (!currentUser) return;
        const newPost: UserPost = {
          ...postData,
          id: crypto.randomUUID(),
          author: { username: currentUser.username, name: currentUser.name, avatarUrl: currentUser.avatarUrl || '' },
          createdAt: Date.now(),
          likedBy: [],
          repostedBy: [],
          commentCount: 0,
          comments: [],
          attachedSignalId: signalToAttach?.id,
          attachedTradeIdea: tradeIdeaToAttach || undefined,
        };
        set(state => ({ posts: [newPost, ...state.posts] }));
        set({ signalToAttach: null, tradeIdeaToAttach: null });
      },
      handleDeletePost: (postToDelete) => {
        set(state => ({ posts: state.posts.filter(post => post.id !== postToDelete.id) }));
      },
      handleLikePost: (postToLike) => {
        const { users } = get();
        const currentUser = users?.find(u => u.username === 'CryptoTrader123');
        if (!currentUser) return;
        set(state => ({
          posts: state.posts.map(post => {
            if (post.id === postToLike.id || post.repostOf?.id === postToLike.id) {
              const originalPostId = post.repostOf?.id || post.id;
              // Update the original post
              const updateOriginal = (p: UserPost) => {
                  if (p.id === originalPostId) {
                      const isLiked = p.likedBy.includes(currentUser.username);
                      const newLikedBy = isLiked ? p.likedBy.filter(u => u !== currentUser.username) : [...p.likedBy, currentUser.username];
                      return { ...p, likedBy: newLikedBy };
                  }
                  return p;
              };
              return { ...updateOriginal(post), repostOf: post.repostOf ? updateOriginal(post.repostOf) : undefined };
            }
            return post;
          })
        }));
      },
      handleRepost: (postToRepost) => {
        const { users } = get();
        const currentUser = users?.find(u => u.username === 'CryptoTrader123');
        if (!currentUser) return;
        const originalPost = postToRepost.repostOf || postToRepost;
        const repost: UserPost = {
          id: crypto.randomUUID(), author: { username: currentUser.username, name: currentUser.name, avatarUrl: currentUser.avatarUrl || '' }, content: originalPost.content,
          repostOf: originalPost, createdAt: Date.now(), likedBy: [], repostedBy: [], commentCount: 0, comments: [], mediaUrl: originalPost.mediaUrl, linkPreviewUrl: originalPost.linkPreviewUrl
        };
        set(state => {
          const newPosts = [repost, ...state.posts];
          return { posts: newPosts.map(p => p.id === originalPost.id ? { ...p, repostedBy: [...(p.repostedBy || []), currentUser.username] } : p) };
        });
      },
      handleUndoRepost: (originalPost) => {
        const { users } = get();
        const currentUser = users?.find(u => u.username === 'CryptoTrader123');
        if (!currentUser) return;
        set(state => {
          const postsWithoutRepost = state.posts.filter(p => !(p.repostOf?.id === originalPost.id && p.author.username === currentUser.username));
          return { posts: postsWithoutRepost.map(p => p.id === originalPost.id ? { ...p, repostedBy: (p.repostedBy || []).filter(username => username !== currentUser.username) } : p) };
        });
      },
      handleAddComment: (postId, content, parentId) => {
        const { users } = get();
        const currentUser = users?.find(u => u.username === 'CryptoTrader123');
        if (!currentUser) return;
        const newComment: Comment = {
          id: crypto.randomUUID(), user: { username: currentUser.username, avatarUrl: currentUser.avatarUrl || `https://api.dicebear.com/8.x/pixel-art/svg?seed=${currentUser.username}` },
          content, createdAt: Date.now(), likedBy: [], replies: [],
        };
        set(state => ({
          posts: state.posts.map(post => {
            if (post.id === postId) {
              const updatedComments = parentId ? addReplyRecursively(post.comments, parentId, newComment) : [...post.comments, newComment];
              return { ...post, comments: updatedComments, commentCount: post.commentCount + 1 };
            }
            return post;
          })
        }));
      },
      handleLikeComment: (postId, commentId) => {
        const { users } = get();
        const currentUser = users?.find(u => u.username === 'CryptoTrader123');
        if (!currentUser) return;
        set(state => ({
          posts: state.posts.map(post => {
            if (post.id === postId) {
              const updatedComments = updateCommentRecursively(post.comments, commentId, (comment) => {
                const isLiked = comment.likedBy.includes(currentUser.username);
                const newLikedBy = isLiked ? comment.likedBy.filter(u => u !== currentUser.username) : [...comment.likedBy, currentUser.username];
                return { ...comment, likedBy: newLikedBy };
              });
              return { ...post, comments: updatedComments };
            }
            return post;
          })
        }));
      },
      findOrCreateConversation: (username) => {
        const { users, conversations } = get();
        const currentUser = users?.find(u => u.username === 'CryptoTrader123');
        if (!currentUser) {
            throw new Error("Cannot find or create conversation without a current user.");
        }
        let convo = conversations.find(c => c.participantUsernames.includes(username) && c.participantUsernames.includes(currentUser.username));
        if (!convo) {
            const newConvo: DirectMessageConversation = { id: crypto.randomUUID(), participantUsernames: [currentUser.username, username], messages: [] };
            set(state => ({ conversations: [newConvo, ...state.conversations] }));
            return newConvo;
        }
        return convo;
      },
      handleSendMessage: (receiverUsername, content) => {
        const { users } = get();
        const currentUser = users?.find(u => u.username === 'CryptoTrader123');
        if (!currentUser) return;
        const newMessage: DirectMessage = { id: crypto.randomUUID(), senderUsername: currentUser.username, content, timestamp: Date.now(), isRead: false };
        const convo = get().findOrCreateConversation(receiverUsername);
        set(state => ({
          conversations: state.conversations.map(c => c.id === convo.id ? { ...c, messages: [...c.messages, newMessage] } : c)
        }));
      },
      handleOpenMessage: (username, setPage) => {
        const { users } = get();
        if (!users?.find(u => u.username === 'CryptoTrader123')) return;
        
        const convo = get().findOrCreateConversation(username);
        set({ activeConversationId: convo.id });
        setPage('messages');
      },
      handleMarkNotificationsAsRead: (ids) => {
        set(state => ({
          notifications: state.notifications.map(n => (ids.includes(n.id) ? { ...n, isRead: true } : n))
        }));
      },
      handleSharePost: (receiverUsername, setPage) => {
        const { users, postToShare, findOrCreateConversation, setPendingMessage, setActiveConversationId, setPostToShare } = get();
        if (!postToShare) return;
        if (!users?.find(u => u.username === 'CryptoTrader123')) return;

        const postUrl = new URL(`#/posts/${postToShare.id}`, window.location.href).href;
        const messageContent = `Check out this post: ${postUrl}`;
        const convo = findOrCreateConversation(receiverUsername);
        setPendingMessage({ conversationId: convo.id, content: messageContent });
        setActiveConversationId(convo.id);
        setPage('messages');
        setPostToShare(null);
      },
      handleShareSignalAsPost: (signal, setPage) => {
        set({ signalToAttach: signal });
        setPage('profile');
      }
    }),
    {
      name: 'social-storage',
      partialize: (state) => ({
        users: state.users,
        posts: state.posts,
        strategies: state.strategies,
        conversations: state.conversations,
        notifications: state.notifications,
      }),
    }
  )
);