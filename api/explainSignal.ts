import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { symbol, reasoning }: { symbol: string, reasoning: string } = req.body;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

        res.status(200).json({ explanation: response.text.trim() });

    } catch (error: any) {
        console.error("Error in /api/explainSignal:", error);
        res.status(500).json({ message: error.message || 'An internal server error occurred.' });
    }
}
