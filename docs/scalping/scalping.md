# Scalping: High-Frequency AI Assistance

The **Scalping** page is a specialized environment built for speed, precision, and high-frequency trading. It focuses on lower timeframes (1m, 3m, 5m) and provides a suite of tools to help you capitalize on short-term market volatility. The AI analysis on this page is tailored to find immediate opportunities that may last anywhere from a few minutes to an hour.

## Core Components

The Scalping interface is a dynamic workspace composed of two main areas:

1.  **The Controls Panel:** A slide-out panel where you configure the AI's parameters, manage presets, and control advanced automation features like One-Click Trading and Autopilot.
2.  **The Main Dashboard:** The central view that displays the live chart, the generated AI signal, and any currently active trades. This area is supplemented by floating windows for deeper real-time analysis.

---

## The Controls Panel: Your Command Center

This panel is your mission control for all scalping activities.

### Presets

-   **Function:** Save and load your entire control panel configuration. This is essential for quickly switching between different assets or scalping strategies without having to manually re-enter settings.
-   **Usage:** Select a saved preset from the dropdown to instantly load its settings. Click "Save Current as Preset" to save your current configuration.

### One-Click Chart Trading

-   **Function:** Enables instant trade execution directly from the chart. When toggled on, Buy and Sell buttons will appear on the price chart, allowing you to enter a market position with a single click.
-   **Usage:** Toggle the switch to enable it. The trade size is determined by the "Margin" value set in the Risk Parameters. **Use this feature with extreme caution, as trades are executed immediately.**

### Auto Execution

-   **Function:** Automatically simulates the execution of an AI-generated signal if its confidence level meets or exceeds your defined threshold.
-   **Usage:** Enable the toggle and use the slider to set the **Confidence Threshold**. This tells the system to "auto-click" the execute button for you on high-probability signals.

### Autopilot Mode

-   **Function:** A fully automated trading bot. When active, the AI will continuously scan the market based on your settings, automatically execute trades that meet your criteria, monitor the live position, and close it according to its internal logic.
-   **Usage:** Configure your desired settings in the "Autopilot Settings" accordion, then click the "Start" button. The system will enter a loop of **Searching -> Monitoring -> Cooldown** until you manually stop it or it hits a session limit.

### Core Parameters

-   **Exchange & AI Model:** Select your data source and the desired Gemini model.
-   **Symbol:** Choose the cryptocurrency pair to analyze.
-   **Chart Interval (Timeframe):** Critical for scalping. Lower timeframes like **1m, 3m, and 5m** are recommended to capture short-term price action.
-   **Trading Style:** This guides the AI's focus:
    -   **Balanced:** The default, all-purpose analysis.
    -   **Momentum Breakout:** Looks for setups where price is breaking a key level with high volume.
    -   **Liquidity Sweep:** Prioritizes setups where price takes out a recent high/low and then quickly reverses.
    -   **Range Scalp:** Ideal for choppy, non-trending markets, looking for moves between support and resistance.

### Advanced Parameters (Risk Parameters)

-   **Margin ($) & Risk (%):** Define the capital and risk for each trade. These values are crucial as they are used by One-Click Trading and Autopilot to determine position size.
-   **Leverage:** Set your desired leverage. In scalping, this is often higher, but risk should be managed carefully.
-   **Allow AI High Leverage:** Permits the AI to recommend leverage over 20x for very high-confidence signals.

---

## The Main Dashboard & Floating Windows

### Live Price Chart

The real-time chart is your main view of the market. When One-Click Trading is enabled, you'll see interactive Buy/Sell buttons directly on the chart for rapid trade entry.

### The Signal Card

Similar to the Signal Gen page, this card displays the AI's trade idea. For scalping, signals are designed for immediate action and have a much shorter **Duration**. The `Execute` buttons allow you to simulate placing the trade with a broker.

### Live Positions

When a trade is active (either manually executed or via Autopilot), a **Live Position Card** appears below the chart. It tracks your position's real-time **Unrealized P/L**, entry price, size, and provides controls to manually **Close Position** or **Modify** the Take Profit and Stop Loss levels.

### Interactive Order Management

For active trades, the Take Profit (green) and Stop Loss (red) levels are displayed as **solid, draggable lines** directly on the price chart.

-   **Modify with a Drag:** Simply click and drag your TP or SL line to a new price level. The line will follow your cursor, providing instant visual feedback.
-   **Instant Update:** When you release the mouse, the order modification is submitted instantly, allowing for incredibly fast and intuitive trade management.
-   **Visual Distinction:** Live position lines are solid, while the dotted lines representing AI *signal ideas* are non-interactive. This clearly separates an active trade from a potential setup.

### Floating Windows (Layouts)

Click the "Layout" button in the top right to open powerful, draggable windows for deeper analysis:

-   **Favorite Pairs:** A grid of your most-traded symbols. Click a symbol to instantly switch the chart, or click the lightning bolt icon to generate a new signal for that pair with one click.
-   **Order Book:** A live, vertical display of all current buy (bids) and sell (asks) orders. This helps you visualize market depth, identify large "walls" of orders that could act as support/resistance, and gauge short-term sentiment.
-   **Time & Sales:** A real-time feed of every single trade being executed on the exchange. Watch this to spot momentum, see if large market orders are pushing the price, or if price is being "absorbed" at a key level.
