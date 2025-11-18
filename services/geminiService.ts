import { GoogleGenAI, Type } from "@google/genai";
import type { Signal, UserParams, PerpTrade, SpotTrade, TradeIdea, AIFeedback, OrderBookUpdate, LiveTrade, ScreenerResult, CandleStick, Timeframe } from "@/types";
import { TRADING_KNOWLEDGE_CONTEXT, SCALPING_KNOWLEDGE_CONTEXT } from "./ai-prompts";
import * as exchangeService from '@/services/exchangeService';

// Define the type for import.meta.env to resolve TypeScript error
declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

// Get API key from environment - in browser, this will be processed by Vite
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API key is not set. Please set VITE_GEMINI_API_KEY in your .env file");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "" });

// SYMBOLS_TO_SCAN constant for runMarketScreener
const SYMBOLS_TO_SCAN = [
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'BNBUSDT', 'ADAUSDT',
    'AVAXUSDT', 'LINKUSDT', 'TRXUSDT', 'DOTUSDT', 'MATICUSDT', 'TONUSDT', 'SHIBUSDT',
    'ICPUSDT', 'LTCUSDT', 'BCHUSDT', 'NEARUSDT', 'UNIUSDT', 'INJUSDT', 'OPUSDT',
    'ARBUSDT', 'FETUSDT', 'RNDRUSDT', 'WLDUSDT', 'PEPEUSDT'
];

/**
 * Generates a swing trading signal by fetching data and calling the Gemini API directly.
 */
export async function generateSignal(params: UserParams): Promise<Signal> {
    const allTimeframes: Timeframe[] = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '1d', '1w'];
    const getNeighborTimeframes = (tf: Timeframe): { ltf: Timeframe | null, htf: Timeframe | null } => {
        const currentIndex = allTimeframes.indexOf(tf);
        return {
            ltf: currentIndex > 0 ? allTimeframes[currentIndex - 1] : null,
            htf: currentIndex < allTimeframes.length - 1 ? allTimeframes[currentIndex + 1] : null,
        };
    };

    const { htf } = getNeighborTimeframes(params.timeframe);

    const [primaryData, htfData] = await Promise.all([
        exchangeService.fetchData(params.exchange, params.symbol, params.timeframe, 150),
        htf ? exchangeService.fetchData(params.exchange, params.symbol, htf, 100) : Promise.resolve(null),
    ]);

    const livePrice = primaryData.length > 0 ? primaryData[primaryData.length - 1].close : 0;
    if (livePrice === 0) {
        throw new Error("Could not determine the current price from market data.");
    }

    const prompt = `
        Analyze the following multi-timeframe market data to predict the next trading setup.

        **User Parameters:**
        - Symbol: ${params.symbol}
        - Primary Timeframe: ${params.timeframe}
        - Desired Opportunity Duration: ${params.opportunityDuration}
        - Current Market Price (from last closed candle): ${livePrice}
        - Allow High Leverage (>20x): ${params.allowHighLeverage}
        - Custom Instructions: ${params.customAiParams || 'None'}

        **Market Data:**
        ${htfData ? `- **Higher Timeframe Context (Last 100 candles):**\n${JSON.stringify(htfData, null, 2)}` : ''}
        - **Primary Timeframe (${params.timeframe}) Data (Last 150 candles):**\n${JSON.stringify(primaryData, null, 2)}

        Based on your predictive analysis, provide a trading signal in the specified JSON format.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            direction: { type: Type.STRING, enum: ["LONG", "SHORT"] }, entryRange: { type: Type.ARRAY, items: { type: Type.NUMBER } },
            takeProfit: { type: Type.ARRAY, items: { type: Type.NUMBER } }, stopLoss: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER }, rrRatio: { type: Type.NUMBER }, leverage: { type: Type.NUMBER },
            predictedMoveDuration: { type: Type.STRING }, reasoning: { type: Type.STRING },
            biasSource: { type: Type.STRING, enum: ["Predictive"] }, predictionMode: { type: Type.BOOLEAN },
            biasSummary: {
                type: Type.OBJECT,
                properties: {
                    shortTerm: { type: Type.STRING, enum: ["Bullish", "Bearish", "Neutral"] },
                    midTerm: { type: Type.STRING, enum: ["Bullish", "Bearish", "Neutral"] },
                    longTerm: { type: Type.STRING, enum: ["Bullish", "Bearish", "Neutral"] },
                },
                required: ["shortTerm", "midTerm", "longTerm"]
            },
        },
        required: ["direction", "entryRange", "takeProfit", "stopLoss", "confidence", "rrRatio", "leverage", "predictedMoveDuration", "reasoning", "biasSource", "predictionMode", "biasSummary"]
    };

    const response = await ai.models.generateContent({
        model: params.model,
        contents: prompt,
        config: {
            systemInstruction: TRADING_KNOWLEDGE_CONTEXT,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    const signal: Signal = { ...parsed, tradeDuration: parsed.predictedMoveDuration };
    // @ts-ignore
    delete signal.predictedMoveDuration;

    if (!signal.direction || !signal.entryRange || !signal.takeProfit || !signal.stopLoss) {
        throw new Error("Received malformed signal object from AI.");
    }

    return signal;
}

/**
 * Generates a scalping signal by fetching data and calling the Gemini API directly.
 */
export async function generateScalpingSignal(params: UserParams, _: CandleStick[], __: CandleStick[], orderBookData: OrderBookUpdate | null, liveTrades: LiveTrade[]): Promise<Signal> {
    const allTimeframes: Timeframe[] = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '1d', '1w'];
    const getHtfForScalp = (ltf: Timeframe): Timeframe => {
        const currentIndex = allTimeframes.indexOf(ltf);
        return currentIndex < allTimeframes.length - 1 ? allTimeframes[currentIndex + 1] : allTimeframes[allTimeframes.length - 1];
    };

    const htfTimeframe = getHtfForScalp(params.timeframe as Timeframe);

    const [ltfMarketData, htfMarketData] = await Promise.all([
        exchangeService.fetchData(params.exchange, params.symbol, params.timeframe, 150),
        exchangeService.fetchData(params.exchange, params.symbol, htfTimeframe, 100),
    ]);

    const livePrice = ltfMarketData.length > 0 ? ltfMarketData[ltfMarketData.length - 1].close : 0;
    if (livePrice === 0) {
        throw new Error("Could not determine current price from market data.");
    }

    const prompt = `
        Analyze the following market data for a scalping opportunity.

        **HTF Context (Last 100 candles):**
${JSON.stringify(htfMarketData, null, 2)}
        **LTF Execution (Last 150 candles):**
${JSON.stringify(ltfMarketData, null, 2)}
        **Real-Time Data:**
        - Order Book Snapshot:
${orderBookData ? JSON.stringify(orderBookData, null, 2) : 'Not available.'}
        - Recent Trades:
${liveTrades.length > 0 ? JSON.stringify(liveTrades, null, 2) : 'Not available.'}

        **Parameters & Task:**
        - Symbol: ${params.symbol}
        - Price: ${livePrice}
        - Allow High Leverage: ${params.allowHighLeverage}
        ${params.tradingStyle ? `- Preferred Trading Style: ${params.tradingStyle}` : ''}
        - Task: Predict the next immediate price move. Provide a setup in the specified JSON format.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            direction: { type: Type.STRING, enum: ["LONG", "SHORT"] }, entryRange: { type: Type.ARRAY, items: { type: Type.NUMBER } },
            takeProfit: { type: Type.ARRAY, items: { type: Type.NUMBER } }, stopLoss: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER }, rrRatio: { type: Type.NUMBER }, leverage: { type: Type.NUMBER },
            predictedMoveDuration: { type: Type.STRING }, reasoning: { type: Type.STRING },
            biasSource: { type: Type.STRING, enum: ["Predictive"] }, predictionMode: { type: Type.BOOLEAN },
            biasSummary: {
                type: Type.OBJECT, properties: {
                    shortTerm: { type: Type.STRING, enum: ["Bullish", "Bearish", "Neutral"] },
                    midTerm: { type: Type.STRING, enum: ["Bullish", "Bearish", "Neutral"] },
                    longTerm: { type: Type.STRING, enum: ["Bullish", "Bearish", "Neutral"] },
                }, required: ["shortTerm", "midTerm", "longTerm"]
            },
        },
        required: ["direction", "entryRange", "takeProfit", "stopLoss", "confidence", "rrRatio", "leverage", "predictedMoveDuration", "reasoning", "biasSource", "predictionMode", "biasSummary"]
    };

    const response = await ai.models.generateContent({
        model: params.model,
        contents: prompt,
        config: {
            systemInstruction: SCALPING_KNOWLEDGE_CONTEXT,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    const signal: Signal = { ...parsed, tradeDuration: parsed.predictedMoveDuration };
    // @ts-ignore
    delete signal.predictedMoveDuration;

    if (!signal.direction || !signal.entryRange || !signal.takeProfit || !signal.stopLoss) {
        throw new Error("Received malformed signal object from AI.");
    }
    return signal;
}

/**
 * Gets a second opinion on a trade idea from the Gemini API.
 */
export async function getSecondOpinion(tradeIdea: TradeIdea, marketData: CandleStick[]): Promise<AIFeedback> {
    const systemInstruction = `You are an AI trading co-pilot. Your task is to analyze a user-provided trade idea against the current market data. You must provide a confidence score, a balanced rationale (pros and cons), and optionally, suggest refinements. Be objective and focus on risk and probability. Do not generate a new trade idea; only analyze the one provided.`;

    const prompt = `
        Please analyze the following user-defined trade idea for ${tradeIdea.symbol} on the ${tradeIdea.timeframe} timeframe.

        **User's Trade Idea:**
        - Direction: ${tradeIdea.direction}
        - Entry Price: ${tradeIdea.entry}
        - Take Profit: ${tradeIdea.takeProfit}
        - Stop Loss: ${tradeIdea.stopLoss}

        **Current Market Data (Last 150 candles on ${tradeIdea.timeframe}):**
        ${JSON.stringify(marketData.slice(-150), null, 2)}

        **Your Task:**
        Based on the market data, provide your analysis of the user's idea in the specified JSON format.
    `;

    const secondOpinionSchema = {
        type: Type.OBJECT,
        properties: {
            confidence: { type: Type.NUMBER, description: "Your confidence score (0-100) in the user's provided trade idea." },
            rationale: { type: Type.STRING, description: "A concise analysis of the user's trade idea (pros and cons)." },
            refinements: { type: Type.STRING, description: "Optional: Suggest one or two specific, actionable improvements." }
        },
        required: ["confidence", "rationale"]
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: secondOpinionSchema,
        },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString) as AIFeedback;
    if (typeof parsed.confidence !== 'number' || !parsed.rationale) {
        throw new Error("Received malformed second opinion from AI.");
    }
    return parsed;
}

/**
 * Generates an explanation for a signal from the Gemini API.
 */
export async function explainSignal(symbol: string, reasoning: string): Promise<string> {
    const prompt = `
        As a trading educator, explain the concepts mentioned in the following trade analysis for ${symbol}.
        Break down terms like Market Structure, Liquidity, Fair Value Gaps, or Order Blocks if they are mentioned.
        Keep the explanation clear, educational, and targeted at an intermediate trader.
        Format your response for readability in a plain text/markdown view using paragraphs and bullet points where appropriate.

        Original Analysis:
        ---
        ${reasoning}
        ---
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "You are a helpful and insightful trading analyst who excels at explaining complex topics simply.",
        },
    });

    return response.text.trim();
}

/**
 * Analyzes trading performance using the Gemini API.
 */
export async function analyzeTradingPerformance(perpTrades: PerpTrade[], spotTrades: SpotTrade[]): Promise<string> {
    const recentPerpTrades = perpTrades.filter(t => t.status === 'Closed').slice(0, 50);
    const recentSpotTrades = spotTrades.slice(0, 50);

    const prompt = `
        You are a professional trading coach. Analyze the provided trading history to identify patterns, strengths, and weaknesses. Provide actionable advice for improvement.

        **User's Perpetual Futures Trades (last 50 closed):**
        ${JSON.stringify(recentPerpTrades, ['symbol', 'side', 'pnl', 'pnlPercentage', 'entryDate', 'exitDate'], 2)}

        **User's Spot Trades (last 50):**
        ${JSON.stringify(recentSpotTrades, ['symbol', 'side', 'price', 'quantity', 'total', 'date'], 2)}

        **Your Task:**
        Provide a concise performance review in markdown format with sections: "Overall Summary", "Strengths", "Areas for Improvement", and "Actionable Advice". Be constructive and encouraging.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "You are a helpful and insightful trading coach who provides clear, structured analysis of a user's trade history.",
        },
    });

    return response.text.trim();
}

/**
 * Runs the market screener using the Gemini API.
 */
export async function runMarketScreener(query: string): Promise<ScreenerResult[]> {
    const prompt = `
        User Query: "${query}"

        Market to Scan (list of symbols):
        ${JSON.stringify(SYMBOLS_TO_SCAN)}

        Your Task:
        Analyze the provided list of symbols based on the user's query. Return a list of symbols that best match the criteria. For each symbol, provide a concise rationale.
    `;

    const screenerSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                symbol: { type: Type.STRING },
                rationale: { type: Type.STRING }
            },
            required: ['symbol', 'rationale']
        }
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "You are an expert market analyst. Your task is to screen the provided list of cryptocurrency symbols based on the user's technical analysis query and return only the symbols that match the criteria in the specified JSON format.",
            responseMimeType: "application/json",
            responseSchema: screenerSchema,
        },
    });

    const jsonString = response.text.trim();
    const results = JSON.parse(jsonString);

    if (!Array.isArray(results)) {
        throw new Error("AI returned a non-array response for the screener.");
    }

    return results;
}