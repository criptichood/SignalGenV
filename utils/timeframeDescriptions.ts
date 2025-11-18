import type { Timeframe } from '@/types';

// A map of timeframes to their descriptive names and use-cases.
export const TIMEFRAME_DESCRIPTIONS: Record<Timeframe, { name: string; description: string }> = {
    // Lower Timeframes (Primarily for Scalping)
    '1m': { name: 'The Surgical Entry', description: 'Pinpoint precise entries and exits for very short-term trades.' },
    '3m': { name: 'The Tactical Confirmation', description: 'Confirm micro-trends and fine-tune entries from a 5m setup.' },
    '5m': { name: 'The Strategic View', description: 'Identify immediate scalping opportunities and core setups.' },
    
    // Mid Timeframes (Bridge between Scalping and Swing Trading)
    '15m': { name: 'The Momentum View', description: 'Track intraday momentum shifts and short-term trends.' },
    '30m': { name: 'The Session Trend', description: 'Analyze the trend within a single trading session (e.g., London, NY).' },
    '1h': { name: 'The Core Trend', description: 'Establish the core directional trend for the current day.' },

    // Higher Timeframes (Primarily for Swing Trading)
    '2h': { name: 'The Structural View', description: 'Analyze key multi-session swing points and structural shifts.' },
    '4h': { name: 'The Strategic Bias', description: 'Set the primary directional bias for multi-day swing trades.' },
    '1d': { name: 'The Macro Trend', description: 'Understand the overall market trend on a daily basis.' },
    '1w': { name: 'The Long-Term Outlook', description: 'Analyze the market from a long-term investment perspective.' },
};