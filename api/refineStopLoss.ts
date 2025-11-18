import { GoogleGenAI } from "@google/genai";
import type { CandleStick } from "@/types";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { symbol, direction, entryPrice, currentSL, recentCandles }: {
            symbol: string, direction: 'LONG' | 'SHORT', entryPrice: number, currentSL: number, recentCandles: CandleStick[]
        } = req.body;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `
            You are an expert scalping analyst. A trade has just been executed. Your task is to re-evaluate the stop-loss based on immediate micro-volatility.

            **Trade Context:**
            - Position: ${direction}
            - Symbol: ${symbol}
            - Entry Price: ${entryPrice}
            - Initial Stop-Loss: ${currentSL}

            **Recent 1-Minute Candle Data:**
            ${JSON.stringify(recentCandles, null, 2)}

            **Task:**
            Re-analyze the immediate market conditions based ONLY on the provided data. Is the stop-loss placement at ${currentSL} optimal for the current micro-volatility, or is there a more logical structural level (e.g., just below a recent 1-minute low for a LONG, or above a recent 1-minute high for a SHORT) nearby that offers a better risk profile while keeping the trade viable?

            **Response Format:**
            Provide ONLY the single, refined, optimal stop-loss price as a number. Do not include any other text, explanation, or formatting. Example: 64810.5
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a precise trading analyst that responds with only a single number as requested.",
            },
        });
        
        const text = response.text.trim();
        const refinedPrice = parseFloat(text);

        if (isNaN(refinedPrice)) {
            return res.status(500).json({ message: 'Failed to parse refined SL price from AI response' });
        }

        res.status(200).json({ refinedPrice });

    } catch (error: any) {
        console.error("Error in /api/refineStopLoss:", error);
        res.status(500).json({ message: error.message || 'An internal server error occurred.' });
    }
}
