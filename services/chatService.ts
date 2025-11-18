import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const SYSTEM_INSTRUCTION = `You are a helpful and expertly informed AI assistant for "Signal Gen," a sophisticated cryptocurrency trading application. Your primary role is to assist users by answering questions about the app's features, general trading concepts, risk management, and providing context-aware guidance.

**Your Core Directives:**
1.  **Be Context-Aware:** You will be provided with the user's current page and other relevant data (like the selected crypto symbol or timeframe). Use this context to provide relevant, specific answers. When a full signal object is provided, prioritize it for your answers.
2.  **Be an Educator:** Explain complex trading terms (like Market Structure, Liquidity, Fair Value Gaps) simply and clearly. If a user asks a specific 'how-to' question (e.g., "how do I generate a signal?"), you **MUST** first use the \`getTutorialContent\` function to retrieve the relevant guide. Then, summarize the steps from that guide in your answer. If it's a general question about learning, like "where can I learn about risk management?", you can direct them to the **[Tutorials page](#/tutorials)**.
3.  **Be a Guide:** Help users navigate the app. When you mention a feature that has its own page (like Signal Generation, Scalping, or the Screener), **you must make the page name a clickable link**. For example: "For quick signals, you should use the [Scalping page](#/scalping)." Use the format \`[Page Name](#/page-id)\`. Valid \`page-id\` values are: \`dashboard\`, \`signal-gen\`, \`scalping\`, \`screener\`, \`news\`, \`history\`, \`simulation\`, \`analytics\`, \`calculator\`, \`strategies\`, \`profile\`, \`settings\`, \`tutorials\`.
4.  **Prioritize Safety:** Always promote responsible trading. Emphasize risk management. **Never give financial advice or predict future prices.** Use disclaimers like "This is not financial advice" when appropriate.
5.  **Be Concise:** Provide clear and direct answers. Use formatting like lists and bold text to improve readability.
6.  **Provide Sources:** When summarizing news from the \`summarizeNews\` tool, you will receive titles and URLs. You **MUST** format your response with clickable markdown links to the sources, like \`[Article Title](https://example.com/url)\`.

**Answering Questions About an Active Signal:**
- When the user is on the 'Signal Gen' or 'Scalping' page, their prompt may be prefixed with a context block containing a "SIGNAL DATA" object and "USER PARAMETERS". This represents a trade signal they are currently viewing.
- You **MUST** use this data as the primary source of truth to answer their questions.
- **Perform Calculations:** You are expected to perform calculations based on the signal data. Examples:
  - "What's the average entry?" -> Calculate \`(entryRange[0] + entryRange[1]) / 2\`.
  - "What's my potential loss with $100 margin?" -> Use the user's provided margin. Calculate potential loss percentage: \`(abs(entry - stopLoss) / entry) * leverage\`. Then calculate the dollar amount: \`loss_percentage * 100\`.
  - "If I want to risk only $20, what should my stop loss be?" -> This requires calculating position size first. Explain the concept: a smaller stop distance allows for a larger position size for the same risk amount. Advise them to use the 'Position Size Calculator' on the [Calculator page](#/calculator).
- **Provide Explanations:** Explain the metrics from the signal, like R/R ratio, confidence, or the reasoning provided.

**Function Calling Capabilities:**
- If the user asks you to generate a signal or find a setup, you **MUST** use the \`generateSignal\` or \`generateScalpingSignal\` functions.
- If the user asks you to create a new trading strategy, you **MUST** use the \`createStrategy\` function.
- If the user asks you to create a social media style post for their profile, you **MUST** use the \`createPost\` function.
- If a user asks to summarize news, use the \`summarizeNews\` function.
- If a user asks to set a price alert, use the \`setPriceAlert\` function.
- If a user asks about their current P&L, use the \`getLivePnl\` function.
- Do not make up signals or analysis yourself. Defer to the function calls to trigger the app's internal AI.
- Infer the parameters (symbol, timeframe, etc.) from the user's prompt. If parameters are missing, you can ask for them, but prefer to call the function with what you have. The app has default values.
- After calling a function, inform the user that you have started the process. For example, after creating a strategy, say "I've created and saved that strategy for you. You can find it on the 'Strategies' page."`;

export const generateSignalFunctionDeclaration: FunctionDeclaration = {
  name: 'generateSignal',
  description: 'Generates a standard swing trading signal by analyzing market data. Navigates to the Signal Gen page and initiates the analysis.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      symbol: { type: Type.STRING, description: 'The cryptocurrency symbol, e.g., BTCUSDT' },
      timeframe: { type: Type.STRING, enum: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '3h', '4h', '1d', '1w'], description: 'The chart timeframe for the analysis.' },
      margin: { type: Type.NUMBER, description: 'The amount of margin in USD to use for the trade.' },
      leverage: { type: Type.NUMBER, description: 'The leverage to apply, e.g., 20 for 20x.' },
      risk: { type: Type.NUMBER, description: 'The percentage of margin to risk on the trade.' },
    },
    required: ['symbol', 'timeframe'],
  },
};

export const generateScalpingSignalFunctionDeclaration: FunctionDeclaration = {
  name: 'generateScalpingSignal',
  description: 'Generates a short-term scalping signal. Navigates to the Scalping page and initiates the analysis.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      symbol: { type: Type.STRING, description: 'The cryptocurrency symbol, e.g., BTCUSDT' },
      timeframe: { type: Type.STRING, enum: ['1m', '3m', '5m', '15m', '30m', '1h'], description: 'The chart timeframe for the scalping analysis.' },
      margin: { type: Type.NUMBER, description: 'The amount of margin in USD to use for the trade.' },
      leverage: { type: Type.NUMBER, description: 'The leverage to apply, e.g., 20 for 20x.' },
      risk: { type: Type.NUMBER, description: 'The percentage of margin to risk on the trade.' },
      tradingStyle: {
        type: Type.STRING,
        enum: ['Balanced', 'Momentum Breakout', 'Liquidity Sweep', 'Range Scalp'],
        description: "Influences the AI's analysis. For example, 'Momentum Breakout' will look for setups where price is breaking a key level with high volume."
      },
    },
    required: ['symbol', 'timeframe'],
  },
};

export const createStrategyFunctionDeclaration: FunctionDeclaration = {
  name: 'createStrategy',
  description: 'Creates a new trading strategy and saves it to the user\'s "Strategies" page.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'The title of the trading strategy.' },
      description: { type: Type.STRING, description: 'A detailed, markdown-supported description of the strategy, including entry/exit rules and risk management.' },
      tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of relevant tags, e.g., "scalping", "BTC", "market-structure". Provide an empty array if no tags are applicable.' },
      isPublic: { type: Type.BOOLEAN, description: 'Whether the strategy should be visible on the user\'s public profile. Defaults to false.' },
    },
    required: ['title', 'description', 'tags', 'isPublic'],
  },
};

export const createPostFunctionDeclaration: FunctionDeclaration = {
  name: 'createPost',
  description: 'Creates a new social media-style post on the user\'s profile page.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      content: { type: Type.STRING, description: 'The text content of the post. Can include links and markdown-like formatting.' },
    },
    required: ['content'],
  },
};

export const summarizeNewsFunctionDeclaration: FunctionDeclaration = {
    name: 'summarizeNews',
    description: "Summarizes the latest news about a specific cryptocurrency or topic from the app's news feed.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            topic: { type: Type.STRING, description: 'The topic or cryptocurrency to summarize news for, e.g., "Solana", "DeFi", "regulation".' },
        },
        required: ['topic'],
    },
};

export const getLivePnlFunctionDeclaration: FunctionDeclaration = {
    name: 'getLivePnl',
    description: "Retrieves the user's total unrealized profit and loss from all currently open live positions.",
    parameters: { type: Type.OBJECT, properties: {} },
};

export const setPriceAlertFunctionDeclaration: FunctionDeclaration = {
    name: 'setPriceAlert',
    description: 'Sets a price alert for a specific cryptocurrency, which will trigger a notification in the app.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            symbol: { type: Type.STRING, description: 'The cryptocurrency symbol to set an alert for, e.g., BTCUSDT.' },
            price: { type: Type.NUMBER, description: 'The price at which to trigger the alert.' },
        },
        required: ['symbol', 'price'],
    },
};

export const getTutorialContentFunctionDeclaration: FunctionDeclaration = {
    name: 'getTutorialContent',
    description: "Retrieves the content of a specific tutorial article from the app's documentation. Use this to answer a user's specific 'how-to' questions.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            title: {
                type: Type.STRING,
                description: 'The exact title of the tutorial to retrieve. e.g., "How to Generate a Swing Trade Signal".'
            },
        },
        required: ['title'],
    },
};


export async function generateChatTitle(prompt: string): Promise<string> {
    try {
        const titlePrompt = `Generate a very short, concise title (max 5 words) for the following user query. Only return the title text, nothing else. Do not use quotes. Query: "${prompt}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: titlePrompt,
        });

        // Clean up response to remove potential quotes or extra text
        return response.text.trim().replace(/^"|"$/g, '');
    } catch (error) {
        console.error("Error generating chat title:", error);
        // Fallback to simple truncation on failure
        return prompt.length > 30 ? prompt.substring(0, 27) + '...' : prompt;
    }
}