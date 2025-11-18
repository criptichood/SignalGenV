# Procedure: Migrating Dashboard Chart to Supabase Realtime

## Objective
To migrate the live BTC chart on the **Dashboard** from a direct client-side WebSocket connection to the exchange, to a more scalable and secure backend-powered solution using **Supabase Realtime**.

## Architecture Overview
This migration follows the Backend-for-Frontend (BFF) pattern. A server-side process will be responsible for fetching data, and the frontend will subscribe to a broadcast from our Supabase backend.

1.  **Data Ingestion (Supabase Edge Function):** A long-running or scheduled Supabase Edge Function will establish a single, persistent WebSocket connection to the exchange's API (e.g., Binance) to receive 1-minute `BTCUSDT` candle updates.
2.  **Data Storage (Supabase Postgres):** The Edge Function will write (UPSERT) each incoming candle update into a dedicated Postgres table.
3.  **Data Broadcasting (Supabase Realtime):** The frontend client will subscribe to changes on this specific table using the Supabase Realtime client. When a new candle is inserted or updated by the Edge Function, Supabase will automatically and efficiently broadcast that change to all connected clients.

---

## Step 1: Database Setup

First, we need a table to store the live candle data.

1.  Navigate to the **SQL Editor** in your Supabase project.
2.  Run the following SQL to create the `live_candles_1m` table.

```sql
CREATE TABLE live_candles_1m (
    symbol TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,
    "open" NUMERIC NOT NULL,
    "high" NUMERIC NOT NULL,
    "low" NUMERIC NOT NULL,
    "close" NUMERIC NOT NULL,
    PRIMARY KEY (symbol, "timestamp")
);
```

3.  Navigate to **Database > Replication** and ensure the `live_candles_1m` table is enabled for Realtime events.

---

## Step 2: Backend Data Ingestion (Edge Function)

Next, we create the server-side function to listen to the exchange and update our database.

1.  Create a new Supabase Edge Function, for example, `exchange-stream`.
2.  This function will use a WebSocket client (like `deno-websockets`) to connect to the Binance `BTCUSDT@kline_1m` stream.
3.  On receiving a message from Binance, the function will parse the candle data and use the Supabase client to `UPSERT` it into the `live_candles_1m` table.

#### `supabase/functions/exchange-stream/index.ts` (Conceptual)
```typescript
import { createClient } from '@supabase/supabase-js';
import { WebSocket } from 'https://deno.land/x/websocket@v0.1.4/mod.ts';

// Initialize Supabase client within the function
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

const ws = new WebSocket('wss://fstream.binance.com/ws/btcusdt@kline_1m');

ws.onmessage = async (event) => {
    const msg = JSON.parse(event.data);
    if (msg && msg.k) {
        const candle = {
            symbol: 'BTCUSDT',
            timestamp: new Date(msg.k.t).toISOString(),
            open: parseFloat(msg.k.o),
            high: parseFloat(msg.k.h),
            low: parseFloat(msg.k.l),
            close: parseFloat(msg.k.c),
        };

        // Upsert the data into Supabase
        const { error } = await supabase
            .from('live_candles_1m')
            .upsert(candle);

        if (error) {
            console.error('Supabase upsert error:', error);
        }
    }
};
```

---

## Step 3: Frontend Client Integration

Finally, update the `ChartWidget.tsx` component to listen to Supabase Realtime instead of `useExchangeWebSocket`.

1.  Import the `supabase` client.
2.  Replace the `useExchangeWebSocket` hook with a `useEffect` that sets up a Supabase Realtime subscription.
3.  The subscription will listen for `INSERT` and `UPDATE` events on the `live_candles_1m` table where the symbol is `BTCUSDT`.

#### `components/dashboard/ChartWidget.tsx` (Updated Logic)
```typescript
import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient'; // Assuming this client is now available
import { LivePriceChart } from '@/components/chart/LivePriceChart';
import type { CandleStick } from '@/types';

export const ChartWidget = () => {
    const [chartData, setChartData] = useState<CandleStick[]>([]);
    // Initial data can still be fetched via `useChartDataQuery` or a direct fetch for a fast first-load.

    useEffect(() => {
        const channel = supabase
            .channel('live-btc-chart')
            .on(
                'postgres_changes',
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'live_candles_1m',
                    filter: 'symbol=eq.BTCUSDT'
                },
                (payload) => {
                    const newCandle = {
                        time: new Date(payload.new.timestamp).getTime() / 1000,
                        open: payload.new.open,
                        high: payload.new.high,
                        low: payload.new.low,
                        close: payload.new.close,
                    };
                    
                    setChartData(prevData => {
                        const lastCandle = prevData[prevData.length - 1];
                        // If it's an update to the latest candle
                        if (lastCandle && newCandle.time === lastCandle.time) {
                            const newData = [...prevData];
                            newData[newData.length - 1] = newCandle;
                            return newData;
                        }
                        // If it's a new candle
                        return [...prevData, newCandle];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const livePrice = chartData.length > 0 ? chartData[chartData.length - 1].close : null;

    return (
        <LivePriceChart 
            data={chartData}
            symbol="BTCUSDT (Supabase)"
            currentPrice={livePrice}
            isLoading={chartData.length === 0}
            // ... other props
        />
    );
};
```

## Outcome
The dashboard's live chart will be powered by a secure and scalable backend stream. This removes the need for every client to maintain a direct WebSocket connection to Binance, centralizes data fetching, and lays the groundwork for broadcasting data to many users efficiently.