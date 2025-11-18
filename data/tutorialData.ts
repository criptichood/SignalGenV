
export const tutorialsData: Record<string, { title: string; content: string }[]> = {
  "How-To Guides": [
    {
      title: "How to Generate a Swing Trade Signal",
      content: `Follow these steps to get your first AI-powered swing trade idea on the **Signal Gen** page.\n\n- **Step 1: Open Controls:** Click the panel toggle button on the left edge of your screen to open the **AI Signal Generator** panel.\n- **Step 2: Set Core Parameters:**\n  - **Exchange:** Choose the exchange you trade on.\n  - **AI Model:** Select an AI model. Gemini 2.5 Pro is powerful for deep analysis, while Flash is faster for general use.\n  - **Symbol:** Pick a cryptocurrency pair you want to analyze (e.g., BTCUSDT).\n  - **Chart Interval:** Select your desired timeframe. For swing trading, **1h, 4h, or 1d** are common choices.\n- **Step 3 (Optional): Advanced Settings:** Expand the "Advanced Parameters" section to fine-tune your trade, including setting your **Margin** ($), account **Risk** (%), and desired **Leverage**.\n- **Step 4: Generate!** Click the **"Get AI Signal"** button. The AI will begin its analysis, which may take a moment.\n- **Step 5: Review the Signal:** The **Signal Card** will appear with the AI's prediction, including a precise entry range, stop loss, take profit targets, and the detailed reasoning behind its analysis.`
    },
    {
      title: "How to Use the Scalping Assistant",
      content: `The **Scalping** page is designed for high-frequency, short-term trades on lower timeframes (1m-15m).\n\n- **Generating a Scalp Signal:** Use the controls panel to select your parameters. Lower timeframes like **1m, 5m, and 15m** are recommended. You can also save your favorite settings as **Presets** for quick setup.\n- **Using the Layout Windows:** Enhance your view by enabling floating windows from the \"Layout\" dropdown:\n  - **Favorite Pairs:** Keep your most-traded pairs visible for quick selection and one-click signal generation.\n  - **Order Book:** See live buy/sell orders to gauge market depth and short-term pressure.\n  - **Time & Sales:** Watch executed trades in real-time to spot large orders and momentum shifts.\n- **One-Click Chart Trading:** For maximum speed, enable \"One-Click Chart Trading\" in the controls. This adds Buy/Sell buttons to the chart, allowing you to enter market orders instantly based on your pre-set risk and leverage. **Use with caution!**\n- **Autopilot Mode:** For fully automated trading, configure and activate **Autopilot**. The AI will continuously scan your chosen symbols and automatically execute trades that meet your confidence threshold, managing the position from entry to exit.`
    },
  ],
  "Trading Strategies & Concepts": [
    {
      title: "Trading with the 20 & 200 Moving Average",
      content: `This classic trend-following strategy helps you stay on the right side of the market and can be a powerful filter for AI-generated signals.\n\n- **The 20-Period SMA (Short-Term Trend):** Think of the 20-period Simple Moving Average (SMA) as your primary guide for the immediate trend.\n  - **If the 20 SMA is rising:** The trend is UP. Your bias should be to **buy**. Ignore red (down) candles as temporary pullbacks or \"noise.\"\n  - **If the 20 SMA is declining:** The trend is DOWN. Your bias should be to **sell**. Ignore green (up) candles as temporary bounces.\n\n- **The 200-Period SMA (Long-Term Trend):** The 200 SMA acts as the major, long-term trend indicator. A powerful confirmation is when your trade aligns with both moving averages. For example, taking a LONG trade only when the price is above both the 20 and 200 SMA significantly increases your probability of success.\n\n- **\"Narrow vs. Wide\" States:**\n  - **Narrow State:** When the price, the 20 SMA, and the 200 SMA are all tightly clustered together, it often signals that energy is building for an explosive move.\n  - **Wide State:** When the price and moving averages are far apart, the move may be overextended, and entering a new trade is riskier.\n\nBy using these moving averages on your chart, you can manually confirm if an AI signal aligns with the current market trend, adding an extra layer of confidence to your trading decisions.`
    },
    {
      title: "Market Structure (BOS & CHoCH)",
      content: `Market structure is the foundation of technical analysis. Understanding it helps you identify the trend.\n\n- **Break of Structure (BOS):** When price breaks a previous swing high in an uptrend (or a swing low in a downtrend), it's a sign the current trend is likely to continue.\n- **Change of Character (CHoCH):** This occurs when price fails to make a new high in an uptrend and instead breaks the last swing low (or vice-versa for a downtrend). It's an early signal that the trend may be reversing.`
    },
    {
      title: "Liquidity",
      content: `Liquidity refers to areas on the chart where a large number of orders are likely to be clustered. These are often stop-loss orders.\n\n- **Types of Liquidity:** Equal highs/lows, trendline liquidity, and old session highs/lows are common examples.\n- **Liquidity Grab (Sweep):** Price is often drawn to these zones. A "sweep" is when price quickly moves into a liquidity zone, triggers the orders, and then sharply reverses. This can be a powerful entry signal.`
    },
    {
      title: "Supply & Demand (Order Blocks)",
      content: `These are specific price zones where significant buying or selling pressure originated.\n\n- **Demand Zone (Bullish Order Block):** The last down-candle before a strong upward move that breaks market structure. Traders look to buy when price returns to this zone.\n- **Supply Zone (Bearish Order Block):** The last up-candle before a strong downward move that breaks market structure. Traders look to sell when price returns here.`
    },
    {
      title: "Fair Value Gaps (FVG)",
      content: `An FVG (or Imbalance) is a three-candle pattern representing an inefficient price move. It's a gap between the wick of the first candle and the wick of the third candle.\n\nPrice has a natural tendency to return to these gaps to "rebalance" the price action, making them powerful targets or potential entry zones.`
    },
    {
        title: "Premium vs. Discount",
        content: `This concept helps you buy low and sell high within a specific price range (e.g., between a swing low and a swing high).\n\n- **Discount:** The area below the 50% equilibrium level of the range. You should look for buying opportunities here.\n- **Premium:** The area above the 50% equilibrium. You should look for selling opportunities here.\n\nAligning your entries with this concept increases the probability of your trades.`
    },
  ],
  "Integrations": [
    {
      title: "Binance Integration",
      content: `Signal Gen is deeply integrated with **Binance**, one of the world's largest cryptocurrency exchanges, to provide you with reliable and high-speed market data.\n\n- **Data Source:** We use the Binance Futures API as a primary source for candlestick data (klines), real-time price tickers, and the list of available trading symbols. This ensures the data you see in the charts is accurate and up-to-date.\n- **Simulated Execution:** When you use features like **Auto Execution** or manually execute a trade from a signal, the application simulates these actions based on Binance's market conditions. **Note:** This is a simulation; no real orders are placed on your Binance account.\n- **Future Development:** We are working on deeper integration to allow for secure, API-based trade logging and potentially live trade execution for users who opt-in.`
    },
    {
      title: "Bybit Integration",
      content: `Our integration with **Bybit** provides another top-tier data source, particularly for the derivatives market.\n\n- **Data Source:** Similar to our Binance integration, we use Bybit's API to fetch candlestick data, symbols, and live prices. You can select Bybit as your preferred exchange in the controls panel on both the **Signal Gen** and **Scalping** pages.\n- **Simulated Execution:** The **Scalping** page's trade execution features can be configured to use Bybit's market data, providing a realistic simulation of trading on the platform.`
    },
    {
      title: "Future: Oracles & DEXs",
      content: `To expand our capabilities, we are actively researching and developing integrations with other key players in the Web3 ecosystem.\n\n- **Data Oracles (e.g., Chainlink):** For ultimate price accuracy and security, we plan to integrate decentralized oracles. This would provide an aggregated, tamper-resistant price feed, which is especially important for DeFi-related analysis and execution.\n- **Decentralized Exchanges (DEXs):** To power our upcoming **Memes Scalp** page, we will integrate with leading DEX data aggregators (like DexScreener or Birdeye). This will allow us to provide real-time data for newly launched and trending tokens on chains like Solana and BNB Smart Chain.`
    }
  ],
  "Security": [
    {
      title: "Wallet Security",
      content: `The golden rule of crypto is **"Not your keys, not your crypto."**\n\n- **Hardware Wallets (Cold Storage):** Physical devices (like Ledger or Trezor) that store your private keys offline. This is the most secure way to store your assets long-term.\n- **Software Wallets (Hot Wallets):** Applications on your computer or phone (like MetaMask or Phantom). They are convenient for daily use but are connected to the internet, making them more vulnerable.\n- **Seed Phrase:** Your master password. **Never** share it with anyone or store it digitally (e.g., in a text file or screenshot). Write it down and keep it in a secure, physical location.`
    },
    {
      title: "Phishing & Common Scams",
      content: `Scammers are constantly trying to steal your funds. Be vigilant.\n\n- **Impersonation:** Scammers pretend to be support staff on platforms like Discord or Telegram and ask for your seed phrase. **No legitimate support will ever ask for your seed phrase.**\n- **Fake Websites:** Always double-check the URL of any crypto site you visit. Scammers create clones of popular sites to trick you into connecting your wallet.\n- **Malicious Airdrops:** Be wary of random tokens appearing in your wallet. Interacting with them by trying to sell or transfer them can sometimes trigger a malicious smart contract that drains your funds.`
    },
  ],
  "Exchanges": [
    {
      title: "Centralized Exchanges (CEX)",
      content: `A CEX is a platform like Binance, Coinbase, or KuCoin that is run by a central company.\n\n- **Pros:** High liquidity, user-friendly interfaces, customer support, and often more features.\n- **Cons:** They are custodial, meaning they hold your private keys. You are trusting them with your funds, making you vulnerable to company failure or hacks.`
    },
    {
      title: "Decentralized Exchanges (DEX)",
      content: `A DEX is a peer-to-peer marketplace like Uniswap or PancakeSwap that operates without a central authority.\n\n- **Pros:** Non-custodial (you always control your keys), permissionless (anyone can list a token), and transparent on the blockchain.\n- **Cons:** You have to pay network "gas" fees for every transaction, you are responsible for your own security, and you can suffer from "impermanent loss" when providing liquidity.`
    },
  ]
};
