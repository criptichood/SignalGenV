import { useEffect, useRef, useCallback } from 'react';
import type { CandleStick, Exchange, Timeframe, OrderBookUpdate, LiveTrade } from '@/types';

type StreamType = 'kline' | 'depth' | 'trade';
type StreamData<T extends StreamType> = T extends 'kline' ? CandleStick : T extends 'depth' ? OrderBookUpdate : LiveTrade;

interface UseExchangeWebSocketProps<T extends StreamType> {
    exchange: Exchange;
    symbol: string;
    type: T;
    interval?: Timeframe; // Only required for 'kline'
    onMessage: (data: StreamData<T>) => void;
    onConnectionError?: (message: string) => void;
    enabled?: boolean;
}

const RECONNECT_DELAY = 5000;

const bybitIntervalMap: Record<Timeframe, string> = { '1m': '1', '3m': '3', '5m': '5', '15m': '15', '30m': '30', '1h': '60', '2h': '120', '4h': '240', '1d': 'D', '1w': 'W' };

const exchangeConfigs = {
    binance: {
        getUrl: (symbol: string, type: StreamType, interval?: Timeframe) => {
            const streamName = {
                kline: `${symbol.toLowerCase()}@kline_${interval}`,
                depth: `${symbol.toLowerCase()}@depth5@100ms`,
                trade: `${symbol.toLowerCase()}@trade`,
            }[type];
            return `wss://fstream.binance.com/ws/${streamName}`;
        },
        getSubscribeMessage: () => null,
        parseMessage: (event: MessageEvent, type: StreamType): any | null => {
            const msg = JSON.parse(event.data);
            if (type === 'kline' && msg.k) {
                return { time: msg.k.t / 1000, open: parseFloat(msg.k.o), high: parseFloat(msg.k.h), low: parseFloat(msg.k.l), close: parseFloat(msg.k.c) };
            }
            if (type === 'depth') {
                return { bids: msg.b, asks: msg.a };
            }
            if (type === 'trade') {
                return { id: msg.t, price: msg.p, quantity: msg.q, time: msg.T, isBuyerMaker: msg.m };
            }
            return null;
        }
    },
    bybit: {
        getUrl: () => `wss://stream.bybit.com/v5/public/linear`,
        getSubscribeMessage: (symbol: string, type: StreamType, interval?: Timeframe) => {
            const topic = {
                kline: `kline.${bybitIntervalMap[interval!]}.${symbol}`,
                depth: `orderbook.50.${symbol}`,
                trade: `publicTrade.${symbol}`,
            }[type];
            return JSON.stringify({ op: 'subscribe', args: [topic] });
        },
        getHeartbeatMessage: () => JSON.stringify({ op: 'ping' }),
        parseMessage: (event: MessageEvent, type: StreamType): any | null => {
            const msg = JSON.parse(event.data);
            if (msg.op === 'subscribe' || msg.op === 'pong' || msg.op === 'ping') return null;

            if (type === 'kline' && msg.topic?.startsWith('kline')) {
                const candle = msg.data[0];
                return { time: parseInt(candle.start) / 1000, open: parseFloat(candle.open), high: parseFloat(candle.high), low: parseFloat(candle.low), close: parseFloat(candle.close) };
            }
            if (type === 'depth' && msg.topic?.startsWith('orderbook')) {
                return { type: msg.type, bids: msg.data.b, asks: msg.data.a };
            }
            if (type === 'trade' && msg.topic?.startsWith('publicTrade')) {
                return msg.data.map((trade: any) => ({
                    id: trade.i,
                    price: trade.p,
                    quantity: trade.v,
                    time: parseInt(trade.T),
                    isBuyerMaker: trade.S === 'Sell',
                }));
            }
            return null;
        }
    },
};

export function useExchangeWebSocket<T extends StreamType>({ exchange, symbol, type, interval, onMessage, onConnectionError, enabled = true }: UseExchangeWebSocketProps<T>) {
    const wsRef = useRef<WebSocket | null>(null);
    const pingIntervalRef = useRef<number | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);
    const onMessageRef = useRef(onMessage);
    const onConnectionErrorRef = useRef(onConnectionError);

    useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
    useEffect(() => { onConnectionErrorRef.current = onConnectionError; }, [onConnectionError]);

    const clearTimers = useCallback(() => {
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    }, []);

    const connect = useCallback(() => {
        if (!symbol || !exchange || (type === 'kline' && !interval)) return;
        clearTimers();

        const config = exchangeConfigs[exchange as keyof typeof exchangeConfigs];
        if (!config) {
            console.error(`WebSocket not implemented for ${exchange}`);
            return;
        }

        const ws = new WebSocket(config.getUrl(symbol, type, interval));
        wsRef.current = ws;

        ws.onopen = () => {
            const subMsg = config.getSubscribeMessage(symbol, type, interval);
            if (subMsg) ws.send(subMsg);

            const heartbeatMsg = (config as any).getHeartbeatMessage?.();
            if (heartbeatMsg) {
                pingIntervalRef.current = window.setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(heartbeatMsg);
                    }
                }, 20000);
            }
        };

        ws.onmessage = (event) => {
            try {
                const parsedData = config.parseMessage(event, type);
                if (Array.isArray(parsedData)) {
                    parsedData.forEach(item => {
                      if (item) onMessageRef.current(item as StreamData<T>);
                    });
                } else if (parsedData) {
                    onMessageRef.current(parsedData as StreamData<T>);
                }
            } catch (e) {
                console.warn("Could not parse WebSocket message:", event.data, e);
            }
        };

        ws.onerror = () => {
            onConnectionErrorRef.current?.(`Live data connection error for ${symbol}.`);
        };

        ws.onclose = (event) => {
            clearTimers();
            if (wsRef.current && event.code !== 1000) {
                onConnectionErrorRef.current?.(`Live data for ${symbol} disconnected. Reconnecting...`);
                reconnectTimeoutRef.current = window.setTimeout(connect, RECONNECT_DELAY);
            }
        };
    }, [exchange, symbol, type, interval, clearTimers]);

    useEffect(() => {
        if (enabled && symbol) {
            connect();
        }

        return () => {
            clearTimers();
            if (wsRef.current) {
                wsRef.current.onclose = null; // Prevent reconnect on manual disconnect
                wsRef.current.close(1000, "Component unmounting");
                wsRef.current = null;
            }
        };
    }, [enabled, symbol, exchange, type, interval, connect, clearTimers]);
}