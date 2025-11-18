# Perpetuals Log: Track Your Leveraged Trades

The **Perpetuals Log** is your dedicated journal for manually recording and analyzing your leveraged futures trades. Tracking these trades is essential for understanding your performance with leverage, managing risk, and refining your strategies over time.

## Features Overview

### 1. Performance Stat Cards

The cards at the top of the page give you a high-level overview of your profitability and consistency in the futures market:

-   **Total Net P/L:** The sum of profits and losses from all your *closed* perpetual trades.
-   **Win Rate:** The percentage of your closed trades that were profitable.
-   **Winning Trades:** The total count of your profitable trades.
-   **Losing Trades:** The total count of your unprofitable trades.

### 2. Logging a New Trade

Click the **"Log New Trade"** button to open a modal specifically designed for perpetual futures:

-   **Core Setup:** Define the `Symbol`, `Side` (Long/Short), and `Status` (Open/Closed).
-   **Execution Details:**
    -   Enter the `Entry Price`, the `Margin` ($) you allocated to the trade, and the `Leverage` you used.
    -   The `Quantity` (position size in the asset) is automatically calculated based on these inputs.
    -   Record the `Entry Date` and the `Fees` paid.
-   **Closing Details:** If the trade `Status` is set to "Closed," you will be prompted to enter the `Exit Price` and `Exit Date`. The application will then automatically calculate your **P/L** and **P/L %** for that trade.
-   **Journaling:** Just like the Spot Log, you have powerful tools for post-trade analysis:
    -   **Strategy Tags:** Tag the trade with the strategy used (e.g., "liquidity-sweep," "scalp").
    -   **Chart Screenshot URL:** Link to a chart image for visual context.
    -   **Notes / Post-Mortem:** Use the rich-text editor to detail your trade rationale, execution quality, and what you learned.

### 3. Managing Your Log

The main table displays all your logged perpetual trades. You can:

-   **Filter and Search:** Quickly find trades for a specific symbol or filter by "Long" or "Short" side.
-   **Edit:** Click the action menu (...) on any trade to open the modal and update its details (e.g., to close an open position by adding an exit price).
-   **Delete:** Permanently remove a trade from your log.

### 4. Import & Export

-   **Export:** Save your entire filtered trade history as a `.json` file for backup or external analysis.
-   **Import:** Load trades from a properly formatted `.json` file to add them to your log.