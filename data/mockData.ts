import type { UserProfile, UserPost, Strategy, DirectMessageConversation, Notification, Comment } from '@/types';

export const MOCK_USERS: UserProfile[] = [
  {
    username: 'CryptoTrader123',
    name: 'Alex Johnson',
    bio: 'Day trader & swing trader. Focusing on BTC, ETH, and SOL. TA enthusiast and risk management advocate. Not financial advice.',
    avatarUrl: 'https://api.dicebear.com/8.x/pixel-art/svg?seed=CryptoTrader123',
    bannerUrl: 'https://images.unsplash.com/photo-1640955033333-90cfb175405d?q=80&w=1920&auto-format&fit=crop',
    location: 'Miami, FL',
    joinedAt: new Date('2022-01-15').getTime(),
    isVerified: true,
    following: ['JaneTrader', 'ETHMaxi'],
    followers: ['JaneTrader', 'ETHMaxi', 'BitcoinBull'],
    socialLinks: {
      twitter: 'https://twitter.com/alex_crypto',
      website: 'https://alexjcrypto.com'
    }
  },
  {
    username: 'JaneTrader',
    name: 'Jane Doe',
    bio: 'Scalping the 1m charts. High-frequency crypto trading.',
    avatarUrl: 'https://api.dicebear.com/8.x/pixel-art/svg?seed=JaneTrader',
    bannerUrl: 'https://images.unsplash.com/photo-1642155787336-83a8b4f63683?q=80&w=1920&auto-format&fit=crop',
    joinedAt: new Date('2021-11-20').getTime(),
    following: ['CryptoTrader123'],
    followers: ['CryptoTrader123', 'BitcoinBull'],
  },
  {
    username: 'ETHMaxi',
    name: 'Vitalik Fan',
    bio: 'Ethereum is the future of finance. #DeFi #NFTs',
    avatarUrl: 'https://api.dicebear.com/8.x/pixel-art/svg?seed=ETHMaxi',
    joinedAt: new Date('2020-05-10').getTime(),
    following: ['CryptoTrader123'],
    followers: ['CryptoTrader123'],
  },
  {
    username: 'BitcoinBull',
    name: 'Satoshi Nakamoto Jr.',
    bio: 'Bitcoin fixes this.',
    avatarUrl: 'https://api.dicebear.com/8.x/pixel-art/svg?seed=BitcoinBull',
    joinedAt: new Date('2019-08-01').getTime(),
    following: ['JaneTrader'],
    followers: ['CryptoTrader123'],
  }
];

const mockComments: Comment[] = [
    {
        id: 'comment-1',
        user: { username: 'JaneTrader', avatarUrl: 'https://api.dicebear.com/8.x/pixel-art/svg?seed=JaneTrader' },
        content: "Nice analysis! I'm seeing similar patterns on the lower timeframes.",
        createdAt: Date.now() - 3600000 * 2,
        likedBy: ['CryptoTrader123'],
        replies: [
            {
                id: 'reply-1',
                user: { username: 'CryptoTrader123', avatarUrl: 'https://api.dicebear.com/8.x/pixel-art/svg?seed=CryptoTrader123' },
                content: "Thanks Jane! Yeah the LTF confluence is what gave me the confidence to take this setup.",
                createdAt: Date.now() - 3600000 * 1,
                likedBy: ['JaneTrader'],
                replies: []
            }
        ]
    }
];

export const MOCK_POSTS: UserPost[] = [
    {
        id: 'post-1',
        author: { username: 'CryptoTrader123', name: 'Alex Johnson', avatarUrl: 'https://api.dicebear.com/8.x/pixel-art/svg?seed=CryptoTrader123' },
        content: "Watching $BTC closely here. We're approaching a key 4H supply zone. Looking for signs of weakness to short, targeting the liquidity resting below the recent lows. A sweep of the highs first would be the ideal entry scenario. #Bitcoin #Trading",
        createdAt: Date.now() - 86400000 * 1, // 1 day ago
        likedBy: ['JaneTrader', 'BitcoinBull'],
        repostedBy: [],
        commentCount: 2,
        comments: mockComments,
        linkPreviewUrl: 'https://www.tradingview.com/chart/BTCUSDT/abcdef'
    },
    {
        id: 'post-2',
        author: { username: 'JaneTrader', name: 'Jane Doe', avatarUrl: 'https://api.dicebear.com/8.x/pixel-art/svg?seed=JaneTrader' },
        content: "Quick 5m scalp on $ETH just now. Caught a nice 1.5R move off the breaker block. The market is giving, you just have to be quick enough to take. #ETH #Scalping",
        createdAt: Date.now() - 3600000 * 5, // 5 hours ago
        likedBy: ['CryptoTrader123'],
        repostedBy: [],
        commentCount: 0,
        comments: [],
        mediaUrl: 'https://images.unsplash.com/photo-1639755491104-4770d1f7c1d3?q=80&w=1080&auto-format&fit=crop'
    }
];

export const MOCK_STRATEGIES: Strategy[] = [
  {
    id: 'strat-1',
    authorUsername: 'CryptoTrader123',
    title: '4H Supply/Demand Zone Reversal',
    description: "1. Identify a strong 4H trend.\n2. Mark out unmitigated Supply or Demand zones.\n3. Wait for price to enter the zone.\n4. Look for a Change of Character (CHoCH) on a lower timeframe (e.g., 15m) for entry confirmation.\n5. Set Stop Loss above/below the zone.\n6. Target opposing liquidity.",
    tags: ['swing', 'supply-demand', 'market-structure'],
    isPublic: true,
    createdAt: Date.now() - 86400000 * 5 // 5 days ago
  },
  {
    id: 'strat-2',
    authorUsername: 'CryptoTrader123',
    title: 'Private RSI Divergence Strategy',
    description: "This is a private strategy focused on identifying bullish and bearish divergence on the RSI across multiple timeframes to predict reversals.",
    tags: ['rsi', 'divergence', 'reversal'],
    isPublic: false,
    createdAt: Date.now() - 86400000 * 10 // 10 days ago
  }
];

export const MOCK_CONVERSATIONS: DirectMessageConversation[] = [
    {
        id: 'convo-1',
        participantUsernames: ['CryptoTrader123', 'JaneTrader'],
        messages: [
            {
                id: 'msg-1',
                senderUsername: 'JaneTrader',
                content: 'Hey Alex, great call on that BTC short!',
                timestamp: Date.now() - 86400000,
                isRead: true
            },
            {
                id: 'msg-2',
                senderUsername: 'CryptoTrader123',
                content: 'Thanks Jane! It was a textbook setup. How are your scalp trades going?',
                timestamp: Date.now() - 86300000,
                isRead: true
            }
        ]
    },
    {
        id: 'convo-2',
        participantUsernames: ['CryptoTrader123', 'BitcoinBull'],
        messages: []
    }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'notif-1',
        type: 'new_follower',
        fromUsername: 'BitcoinBull',
        timestamp: Date.now() - 86400000 * 2,
        isRead: true
    },
    {
        id: 'notif-2',
        type: 'post_like',
        fromUsername: 'JaneTrader',
        relatedEntityId: 'post-1',
        timestamp: Date.now() - 3600000 * 6,
        isRead: false
    }
];