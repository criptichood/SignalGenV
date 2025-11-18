# Simulation: Backtest & Paper Trade

The **Simulation** page is a risk-free environment designed to test your trading ideas against real market data. It allows you to both **backtest** historical signals and **paper trade** new setups in the current live market without committing any real capital.

## The Simulation Workflow

### 1. Creating a Simulation

You can start a simulation in two primary ways:

-   **From History (Backtesting):** On the **AI Signal History** page, every signal has a "Simulate" button. Clicking this will automatically create a new simulation using the exact parameters of that historical signal, ready for you to replay.
-   **Manually (Paper Trading / Custom Backtest):** Click the **"Create Simulation"** button on this page to open a modal where you can build a trade setup from scratch. You define every parameter: the symbol, direction, entry price, take profit targets, stop loss, and leverage.

You can also choose between two modes:
-   **Replay Simulation:** This lets you test your setup against a specific historical time period. The simulation will fetch the data for that period and play it back for you.
-   **Live Simulation:** This uses the current, real-time market data to test your setup, acting as a paper trading account.

### 2. The Playback View

When you start a simulation, the main dashboard transforms into an interactive playback view.

-   **The Chart:** The chart displays the price action and overlays your trade levels (Entry, TP, SL) as clear lines, so you can visually track the trade's progress.
-   **The Control Panel:** To the right of the chart, you'll find the simulation controls:
    -   **Play/Pause:** Start and stop the simulation.
    -   **Speed Controls:** Speed up the replay (`2x`, `5x`, `10x`) to get through a backtest faster.
    -   **Scrubber (Replay Mode Only):** A timeline slider that lets you manually scrub back and forth through the simulation's progress.
-   **Trade Stats:** This panel gives you a real-time view of your simulated trade's performance, including its current **Unrealized P/L (%)**, duration, and status.

### 3. Reviewing the Results

Once a simulation concludes—either by hitting a Take Profit, a Stop Loss, or being manually stopped—the result is permanently logged in the history table.

-   **Stats Summary:** At the top of the history table, you'll find aggregate statistics from all your completed simulations, including your **Total P/L %**, **Win Rate**, and your single **Best** and **Worst** trades.
-   **Simulation History Table:** Every simulation you create is saved here. You can see its configuration, its final outcome, and the resulting P/L. From here, you can choose to re-run or delete any past simulation.