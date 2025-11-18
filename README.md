# Signal Gen - AI Trading Assistant

![Signal Gen Banner](https://images.unsplash.com/photo-1640955033333-90cfb175405d?q=80&w=1920&auto-format&fit=crop)

Signal Gen is a sophisticated, feature-rich web application designed for cryptocurrency traders. It leverages the power of the Google Gemini API to analyze market data, generate predictive trading signals, and provide a suite of tools for comprehensive market analysis, strategy backtesting, and performance tracking.

## ✨ Key Features

- **AI-Powered Signal Generation**: Generate predictive swing and scalp trading signals for various cryptocurrencies using advanced AI models like Gemini 2.5 Pro and Flash.
- **Natural Language Market Screener**: Use plain English to ask the AI to find assets that match specific technical analysis criteria (e.g., "Find coins approaching a key support level").
- **Interactive Live Charts**: Real-time candlestick charts powered by Lightweight Charts, featuring customizable indicators (RSI, Moving Averages), time ranges, and chart types.
- **Advanced Scalping UI**: A dedicated interface for high-frequency trading with floating windows for Order Book, Time & Sales, and Favorite Pairs.
- **AI Assistant Chat**: A powerful chatbot integrated with Gemini for contextual help, general trading knowledge, and function calling to trigger actions within the app.
- **Trade Simulation & Backtesting**: Test signal performance against historical data or in a live simulated environment with a playback-style interface.
- **Comprehensive Trade Logging**: Manually log Spot and Perpetual trades to maintain a detailed trading journal.
- **In-Depth Analytics**: A dedicated dashboard to visualize performance metrics like P/L, win rate, and profitability by asset, including an AI-powered performance review.
- **Social & Community Features**:
    - User profiles with bios, social links, and stats.
    - Create and share posts, including text, images, and attached AI signals.
    - "For You" algorithmic discovery feed.
    - Follow/unfollow users and engage through comments and likes.
    - Direct messaging between users.
- **Strategy Hub**: Create, save, and manage personal trading strategies using a rich-text editor. Share public strategies on your profile.
- **Essential Trading Tools**: A suite of calculators for Position Sizing, Leverage P/L, and Risk/Reward.
- **AI-Analyzed News Feed**: Stay updated with the latest market news, automatically categorized and analyzed for sentiment by Gemini.
- **Customizable Interface**: Personalize your experience with multiple theme modes (Light/Dark) and accent colors.

---

## 🤖 AI Integration with Google Gemini

Signal Gen's intelligence is powered by the **Google Gemini API**. We utilize several of its advanced features to deliver a cutting-edge user experience:

- **Predictive Analysis**: The `gemini-2.5-pro` and `gemini-2.5-flash` models are primed with extensive system instructions (`TRADING_KNOWLEDGE_CONTEXT`) to act as expert trading analysts. They analyze multi-timeframe candlestick data to forecast market movements rather than just reacting to past price action.
- **JSON Mode**: For signal generation and market screening, we enforce a strict JSON output using `responseSchema`. This ensures that the data from the AI is always structured, reliable, and can be directly integrated into the UI without parsing errors.
- **Function Calling**: The AI Assistant can trigger actions within the app. When a user asks it to "find a setup for ETH on the 15m," the AI recognizes this as a request for a function call and returns a structured `generateScalpingSignal` command with the appropriate parameters, which the application then executes.
- **Natural Language Understanding**: The Market Screener and News Feed analysis rely on Gemini's ability to understand and process natural language prompts and unstructured text to deliver categorized, sentiment-analyzed results.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 (with Hooks), TypeScript
- **Styling**: Tailwind CSS with a dynamic theme system
- **State Management**: Zustand (with `persist` middleware for local storage)
- **Data Fetching & Caching**: TanStack Query (React Query)
- **Charting**: Lightweight Charts, Recharts
- **AI**: Google Gemini API (`@google/genai`)

---

## 📂 Project Structure

The project is organized into a modular and scalable structure:

```
/
├── public/
├── components/   # Reusable UI components
│   ├── analytics/
│   ├── calculators/
│   ├── chat/
│   ├── chart/
│   ├── discover/
│   ├── header/
│   ├── icons/
│   ├── messages/
│   ├── perp-log/
│   ├── profile/
│   ├── scalping/
│   ├── signal/
│   ├── signal-gen/
│   ├── simulation/
│   ├── spot-log/
│   ├── stablecoin/
│   ├── strategy/
│   ├── tracking/
│   └── ui/
├── data/         # Mock data for social features
├── hooks/        # Custom React Hooks (e.g., useAnalytics, useChat, useSymbolsQuery)
├── pages/        # Top-level components for each application page
├── services/     # API interaction logic (Gemini, exchanges, etc.)
├── store/        # Zustand state management stores
├── utils/        # Helper functions (date formatting, audio, etc.)
├── App.tsx       # Main application component and routing logic
├── index.html    # Entry point HTML with theme styles
├── index.tsx     # React root renderer
└── types.ts      # Centralized TypeScript type definitions
```

---

## 🚀 Getting Started

Signal Gen is a web-based application and does not require a local setup to run.

1.  **Navigate the App**: Use the sidebar to explore the various pages like Signal Gen, Scalping, Analytics, and more.
2.  **Configure API Keys (Optional)**: For features like simulated trade execution (Scalping page) or using models from OpenRouter, navigate to the **Settings** page and enter your API keys. Keys are stored securely in your browser's local storage.
3.  **Generate a Signal**:
    - Go to the **Signal Gen** or **Scalping** page.
    - Use the controls panel on the left to select an AI model, symbol, and timeframe.
    - Click "Get AI Signal" and wait for the AI to complete its analysis.
    - Review the generated signal on the Signal Card.
4.  **Chat with the AI Assistant**:
    - Click the floating action button to open the chat widget.
    - Ask questions about trading, the app, or even ask it to perform actions like `"create a strategy for me about RSI divergence"`.