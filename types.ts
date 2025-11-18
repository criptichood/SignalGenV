export type Exchange = 'binance' | 'bybit';

export type Page =
  | 'dashboard'
  | 'signal-gen'
  | 'scalping'
  | 'memes-scalp'
  | 'screener'
  | 'news'
  | 'history'
  | 'spot-log'
  | 'perp-log'
  | 'simulation'
  | 'analytics'
  | 'calculator'
  | 'tutorials'
  | 'stablecoin-stash'
  | 'strategies'
  | 'profile'
  | 'view-profile'
  | 'settings'
  | 'discover'
  | 'messages'
  | 'manual-studio';

// PageContext interface is defined here to break circular dependencies
export interface PageContext {
    page: Page;
    symbol?: string;
    timeframe?: string;
    model?: string;
    contextualChatEnabled: boolean;
    functionCallingEnabled: boolean;
    signal?: Signal | null;
    params?: UserParams | null;
}

export interface AiModel {
  id: string;
  name: string;
  provider: 'gemini';
  description: string;
}

export type Timeframe = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '1d' | '1w';
export type ScannerTimeframe = '15m' | '1h' | '4h';

export interface CandleStick {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface UserParams {
  exchange: Exchange;
  model: string;
  symbol: string;
  timeframe: Timeframe;
  opportunityDuration: string;
  margin: number;
  risk: number;
  leverage: number | 'custom';
  customLeverage?: number;
  forceLeverage: boolean;
  allowHighLeverage: boolean;
  customAiParams: string;
  tradingStyle?: string;
}

export interface Signal {
  direction: 'LONG' | 'SHORT';
  entryRange: [number, number];
  takeProfit: number[];
  stopLoss: number;
  confidence: number;
  rrRatio: number;
  leverage: number;
  tradeDuration: string;
  reasoning: string;
  feedback?: string;
  confluences?: string[];
  biasSource?: 'Predictive' | 'Confirmation';
  predictionMode?: boolean;
  biasSummary?: {
    shortTerm: 'Bullish' | 'Bearish' | 'Neutral';
    midTerm: 'Bullish' | 'Bearish' | 'Neutral';
    longTerm: 'Bullish' | 'Bearish' | 'Neutral';
  };
}

export interface SavedSignal extends Signal {
  id: string;
  symbol: string;
  timeframe: Timeframe;
  timestamp: number;
  status: 'Pending' | 'Win' | 'Loss' | 'Closed';
  currentPrice: number; // Price at the time of signal generation
  lastDataTimestamp?: number; // Timestamp of the last candle used
  type?: 'Scalp' | 'Swing' | 'Manual'; // New field to categorize the signal
  hitTps?: number[]; // Array of TP indices hit (e.g., [0, 1] for TP1 and TP2)
}

export interface TrackedSignal {
  id: string;
  signal: Signal;
  params: UserParams;
  timestamp: number;
  windowState: {
    isOpen: boolean;
    isMinimized: boolean;
    position: { x: number; y: number };
  };
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  url: string;
  thumbnail?: string;
  sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
  category?: string;
}

export interface SimulationResult {
  outcome: "TP1 Hit" | "TP2 Hit" | "TP3 Hit" | "SL Hit" | "Expired" | "Stopped";
  duration: string;
  pnl: number;
}

export interface SimulationSetup {
  id:string;
  exchange: Exchange;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryRange: [number, number];
  takeProfit: number[];
  stopLoss: number;
  leverage: number;
  timestamp: number;
  endTime: number;
  mode: 'replay' | 'live';
  status: 'pending' | 'running' | 'completed' | 'paused';
  result?: SimulationResult;
  historicalData?: CandleStick[];
}

export interface SpotTrade {
  id: string;
  symbol: string;
  side: 'Buy' | 'Sell';
  date: number; // timestamp
  price: number;
  quantity: number;
  total: number; // price * quantity
  fees: number;
  notes?: string; // Can store HTML content
  strategyTags?: string[];
  chartImageUrl?: string;
}

export interface PerpTrade {
  id: string;
  symbol: string;
  side: 'Long' | 'Short';
  status: 'Open' | 'Closed';
  entryDate: number; // timestamp
  exitDate?: number; // timestamp
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  margin: number;
  leverage: number;
  pnl?: number; // Profit and Loss
  pnlPercentage?: number;
  fees: number;
  notes?: string; // Can store HTML content
  strategyTags?: string[];
  chartImageUrl?: string;
}

export interface ScalpingPreset {
  id: string;
  name: string;
  params: Partial<UserParams>;
}

export interface OrderBookUpdate {
  asks: [string, string][]; // [price, quantity]
  bids: [string, string][];
}

export interface LiveTrade {
    id: number;
    price: string;
    quantity: string;
    time: number;
    isBuyerMaker: boolean;
}

export interface LivePosition {
  id: string; // Corresponds to the mock orderId
  symbol: string;
  side: 'Long' | 'Short';
  entryPrice: number;
  quantity: number;
  margin: number;
  leverage: number;
  entryDate: number; // timestamp
  takeProfit?: number;
  stopLoss?: number;
}

export type AutopilotState = 'inactive' | 'searching' | 'monitoring' | 'cooldown' | 'stopped';
export type AutopilotScanMode = 'current' | 'favorites-top-5';

export interface AutopilotSettings {
  sessionCapital: number;
  tradeSizeMode: 'fixed' | 'percentage';
  tradeSizeValue: number;
  cooldownMinutes: number;
  maxSessionDrawdown: number;
  maxTrades: number;
}

export interface AutopilotSessionStats {
  initialCapital: number;
  currentCapital: number;
  startTime: number | null;
  pnl: number;
  tradesExecuted: number;
  drawdown: number; // as a percentage
  statusMessage: string;
}

export interface Strategy {
  id: string;
  authorUsername: string;
  title: string;
  description: string;
  tags: string[];
  isPublic: boolean;
  createdAt: number;
}

export interface UserProfile {
  username: string;
  name: string;
  bio: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  joinedAt: number;
  highlights?: string[];
  isVerified?: boolean;
  birthday?: string;
  birthdayPrivacy?: 'public' | 'followers' | 'private';
  following: string[];
  followers: string[];
  socialLinks?: {
    twitter?: string;
    youtube?: string;
    discord?: string;
    website?: string;
  };
}

export interface Comment {
  id: string;
  user: {
    username: string;
    avatarUrl: string;
  };
  content: string;
  createdAt: number;
  likedBy: string[];
  replies: Comment[];
}

// --- AI CO-PILOT TYPES ---
export interface TradeIdea {
  symbol: string;
  timeframe: Timeframe;
  direction: 'LONG' | 'SHORT';
  entry: number;
  takeProfit: number;
  stopLoss: number;
}

export interface AIFeedback {
  confidence: number;
  rationale: string;
  refinements?: string;
}

export interface UserPost {
  id: string;
  author: {
    username: string;
    name: string;
    avatarUrl: string;
  };
  content: string;
  createdAt: number;
  likedBy: string[];
  repostedBy: string[];
  commentCount: number;
  comments: Comment[];
  mediaUrl?: string;
  linkPreviewUrl?: string;
  repostOf?: UserPost; // For reposts
  attachedSignalId?: string; // ID of the attached AI signal from history
  attachedTradeIdea?: { // For user-created ideas with AI feedback
    userIdea: TradeIdea;
    aiFeedback?: AIFeedback;
  };
}

// --- MESSAGING & NOTIFICATION TYPES ---
export interface DirectMessage {
  id: string;
  senderUsername: string;
  content: string;
  timestamp: number;
  isRead: boolean;
}

export interface DirectMessageConversation {
  id: string;
  // An array of 2 usernames for a 1-on-1 chat
  participantUsernames: [string, string];
  messages: DirectMessage[];
}

export interface Notification {
  id: string;
  type: 'new_message' | 'new_follower' | 'post_like';
  fromUsername: string;
  relatedEntityId?: string; // e.g., conversationId or postId
  timestamp: number;
  isRead: boolean;
}


// --- CHATBOT TYPES ---
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

export type ChatIconType = 'bot' | 'sparkles' | 'lightbulb' | 'message';

// --- STABLECOIN STASH TYPES ---
export interface StablecoinHolding {
  symbol: 'USDC' | 'USDT' | 'DAI';
  name: string;
  balance: number;
  value: number; // balance * price (assuming price is always $1)
}

export interface TrackedWallet {
  id: string;
  address: string;
  label: string;
  network: 'Ethereum'; // For now, only Ethereum is supported
}

// --- THEME & SETTINGS TYPES ---
export type ThemeMode = 'light' | 'dark';

export type ThemeAccent =
  | 'cyan'
  | 'red'
  | 'green'
  | 'blue'
  | 'purple'
  | 'orange';

export interface Theme {
  mode: ThemeMode;
  accent: ThemeAccent;
}

// --- SCREENER TYPES ---
export interface ScreenerResult {
    symbol: string;
    rationale: string;
}

export interface ScreenerRun {
  id: string;
  timestamp: number;
  query: string;
  results: ScreenerResult[];
  isLoading: boolean;
  error?: string | null;
}

// --- MEMES SCALP TYPES ---
export interface MemeCoin {
  id: string;
  address: string;
  chain: 'SOL' | 'BNB';
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number; // percentage
  volume24h: number; // in USD
  liquidity: number; // in USD
  marketCap: number; // in USD
  hypeScore: number; // 0-100
  launchDate: number; // timestamp
  safetyMetrics: {
    isLiquidityLocked: boolean;
    isContractVerified: boolean;
    isMintDisabled: boolean;
    top10HolderPercent: number; // percentage
  };
}