import { GoogleGenAI, Type } from "@google/genai";

const SYMBOLS_TO_SCAN = [
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'BNBUSDT', 'ADAUSDT',
    'AVAXUSDT', 'LINKUSDT', 'TRXUSDT', 'DOTUSDT', 'MATICUSDT', 'TONUSDT', 'SHIBUSDT',
    'ICPUSDT', 'LTCUSDT', 'BCHUSDT', 'NEARUSDT', 'UNIUSDT', 'INJUSDT', 'OPUSDT',
    'ARBUSDT', 'FETUSDT', 'RNDRUSDT', 'WLDUSDT', 'PEPEUSDT'
];

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { query }: { query: string } = req.body;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
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
        
        res.status(200).json(results);

    } catch (error: any) {
        console.error("Error in /api/runScreener:", error);
        res.status(500).json({ message: error.message || 'An internal server error occurred.' });
    }
}