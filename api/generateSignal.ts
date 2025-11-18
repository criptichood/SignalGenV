import { GoogleGenAI, Type } from "@google/genai";
import type { CandleStick, Signal, UserParams, Timeframe } from "@/types";
import { TRADING_KNOWLEDGE_CONTEXT } from "./ai-prompts";
import * as exchangeService from '@/services/exchangeService';

// This function will be deployed as a Vercel Serverless Function
export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const params: UserParams = req.body;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const allTimeframes: Timeframe[] = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '1d', '1w'];
        const getNeighborTimeframes = (tf: Timeframe): { ltf: Timeframe | null, htf: Timeframe | null } => {
            const currentIndex = allTimeframes.indexOf(tf);
            return {
                ltf: currentIndex > 0 ? allTimeframes[currentIndex - 1] : null,
                htf: currentIndex < allTimeframes.length - 1 ? allTimeframes[currentIndex + 1] : null,
            };
        };

        const { htf, ltf } = getNeighborTimeframes(params.timeframe);

        const [primaryData, htfData, ltfData] = await Promise.all([
            exchangeService.fetchData(params.exchange, params.symbol, params.timeframe, 150),
            htf ? exchangeService.fetchData(params.exchange, params.symbol, htf, 100) : Promise.resolve(null),
            ltf ? exchangeService.fetchData(params.exchange, params.symbol, ltf, 20) : Promise.resolve(null),
        ]);
        
        const livePrice = primaryData.length > 0 ? primaryData[primaryData.length - 1].close : 0;
        if (livePrice === 0) {
            throw new Error("Could not determine the current price from market data.");
        }

        const prompt = buildPrompt(params, primaryData, ltfData, htfData, livePrice);
        const responseSchema = getResponseSchema();

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

        res.status(200).json(signal);

    } catch (error: any) {
        console.error("Error in /api/generateSignal:", error);
        res.status(500).json({ message: error.message || 'An internal server error occurred.' });
    }
}

// Helper functions copied from the original geminiService
function buildPrompt(params: UserParams, primaryData: CandleStick[], ltfData: CandleStick[] | null, htfData: CandleStick[] | null, livePrice: number): string {
    return `
        Analyze the following multi-timeframe market data to predict the next trading setup.
        
        **User Parameters:**
        - Symbol: ${params.symbol}
        - Primary Timeframe: ${params.timeframe}
        - Current Market Price (from last closed candle): ${livePrice}
        - Allow High Leverage (>20x): ${params.allowHighLeverage}
        - Custom Instructions: ${params.customAiParams || 'None'}

        **Market Data:**
        ${htfData ? `- **Higher Timeframe Context (Last 100 candles):**\n${JSON.stringify(htfData, null, 2)}` : ''}
        - **Primary Timeframe (${params.timeframe}) Data (Last 150 candles):**\n${JSON.stringify(primaryData, null, 2)}
        ${ltfData ? `- **Lower Timeframe Confirmation (Last 20 candles):**\n${JSON.stringify(ltfData, null, 2)}` : ''}

        Based on your predictive analysis, provide a trading signal in the specified JSON format.
    `;
}

function getResponseSchema() {
    return {
        type: Type.OBJECT,
        properties: {
            direction: { type: Type.STRING }, entryRange: { type: Type.ARRAY, items: { type: Type.NUMBER } },
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
}