# Signal Gen: AI Swing Trading

The **Signal Gen** page is the core of the application, designed for generating medium to long-term trade ideas (swing trades). It leverages the power of Gemini to perform deep analysis on higher timeframes (like 1-hour, 4-hour, and daily charts) to predict high-probability market movements.

## Core Components

The Signal Gen interface is divided into two main sections:

1.  **The Controls Panel:** A slide-out panel on the left where you configure every aspect of the AI's analysis before generating a signal.
2.  **The Main Dashboard:** The central area that displays the live price chart for your selected asset and the resulting **Signal Card** once the AI has completed its analysis.

---

## The Controls Panel: Your Command Center

This is where you tell the AI exactly what you're looking for. A thorough configuration leads to more accurate and relevant signals.

### Presets

-   **Function:** Save and load your entire control panel configuration. This is perfect for quickly switching between different strategies (e.g., "BTC 4H Strategy" vs. "ETH 1H Strategy").
-   **Usage:** Select a saved preset from the dropdown to instantly load its settings. Click "Save Current as Preset" to save your current configuration for future use.

### Market Scanner

-   **Function:** An automated assistant that continuously scans your "Favorite Pairs" in the background for high-confidence setups based on your current settings.
-   **Usage:** Toggle the switch to enable it. When a potential setup is found, you'll be alerted, and a signal will be generated automatically.

### Auto Execution

-   **Function:** For advanced users, this allows the application to automatically simulate the execution of a trade if the generated signal's confidence meets a certain threshold. **This is a simulated action and does not place real trades.**
-   **Usage:** Enable the toggle, then set your desired **Confidence Threshold** (e.g., 85%). The AI will only "execute" trades it is highly confident in.

### Core Parameters

These are the essential inputs for any signal generation.

-   **Exchange:** Choose the data source for the AI's analysis (e.g., Binance, Bybit).
-   **AI Model:**
    -   **Gemini 2.5 Pro:** The most powerful model, ideal for deep, complex market analysis. It may take slightly longer but often yields more nuanced insights.
    -   **Gemini 2.5 Flash:** A faster, more efficient model, perfect for general-purpose analysis and quicker results.
-   **Symbol:** Select the cryptocurrency pair you want to analyze. You can search for any symbol or pick from your list of favorites.
-   **Chart Interval (Timeframe):** This is a critical setting that defines the perspective of the analysis. For swing trading, higher timeframes are recommended:
    -   **1h / 4h:** Ideal for multi-day swing trades.
    -   **1d / 1w:** Used for analyzing the major, long-term market trend.

### Advanced Parameters

Click the accordion to reveal fine-tuning options for risk and AI behavior.

-   **Opportunity Duration:** Guide the AI on the expected length of the trade you're looking for. This helps it focus on setups that match your trading style (e.g., a multi-day hold vs. an intraday trade).
-   **Margin ($) & Risk (%):** Define your risk parameters. For example, with a **$1000** margin and **1%** risk, you are telling the AI you are willing to lose **$10** on this trade idea. The AI uses this to help calculate appropriate leverage and position size concepts.
-   **Leverage:**
    -   Select a preset leverage (e.g., 10x, 20x).
    -   Choose "Custom" to enter a specific value.
    -   **Force Use Leverage:** If checked, the AI will incorporate your selected leverage into its R/R calculations. If unchecked, the AI may suggest a more appropriate leverage based on the setup's volatility.
-   **Allow AI High Leverage:** A safety feature. If unchecked, the AI will cap its leverage recommendation at 20x. If checked, it may suggest higher leverage but only for very high-confidence signals (typically >90%).
-   **Custom AI Parameters:** A direct line to the AI. You can add specific instructions here, such as `"focus on setups that respect the 200-period moving average"` or `"prioritize trades that show RSI divergence"`.

---

## The Main Dashboard

### Live Price Chart

This interactive chart shows real-time price action for your selected symbol. You can use the controls at the top of the chart to:
-   Change the time range (e.g., view the last 4 hours or the full day).
-   Add or remove technical indicators like Moving Averages (MA) and the Relative Strength Index (RSI).
-   Switch between chart types (Area, Line, Candlestick).

### The Signal Card

Once you click "Get AI Signal," this card will populate with the AI's findings. It's broken down into several key sections:

-   **Header:** Displays the symbol, the trade direction (Long/Short), a timer for the signal's validity, and the timestamp of the data used for analysis.
-   **Trade Levels:** The actionable plan. It shows the precise **Entry Range**, **Stop Loss**, and one or more **Take Profit** targets. You can manually edit these levels if you see a better placement.
-   **Key Metrics:** A snapshot of the trade's characteristics:
    -   **Confidence:** The AI's confidence level (0-100%) in the predicted setup.
    -   **R/R (TP1):** The risk-to-reward ratio for the first take-profit target.
    -   **Leverage:** The AI's recommended leverage for the trade.
    -   **Duration:** The AI's estimate of how long the trade might take to play out.
-   **AI Analysis:** The detailed, step-by-step reasoning from the AI explaining *why* it chose this setup, citing concepts like market structure, liquidity, and imbalances.
-   **Footer Actions:**
    -   **Explain Signal:** Asks the AI to provide a more detailed, educational breakdown of the technical concepts mentioned in its analysis.
    -   **Share as Post:** Automatically creates a new post draft on your **Profile** page with the signal's key details attached.
    -   **Execute:** Opens a confirmation modal to simulate executing the trade.