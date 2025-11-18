export interface BybitTradeDetails {
    symbol: string;
    side: 'Buy' | 'Sell';
    orderType: 'Market' | 'Limit';
    qty: string;
    price?: string;
    takeProfit?: string;
    stopLoss?: string;
    trailingStop?: string;
}

/**
 * Executes a trade by sending the details to a secure backend endpoint.
 *
 * SECURITY BEST PRACTICE:
 * This function demonstrates the Backend-for-Frontend (BFF) pattern. The frontend sends trade details
 * to our own secure backend (e.g., '/api/execute-trade'), which then securely handles API keys,
 * signs the request, and communicates with the Bybit API. The API key and secret are never
 * exposed in the browser.
 *
 * MOCK IMPLEMENTATION:
 * Since no backend exists in this environment, this function simulates the process. It waits for
 * a short period to mimic network latency and then returns a mock success response. This allows
 * the frontend UI and logic to be fully tested.
 */
export async function executeBybitTrade(
    tradeDetails: BybitTradeDetails
): Promise<any> {
    console.log('--- Sending trade to secure backend proxy (MOCKED) ---');
    console.log('Trade Details:', tradeDetails);

    // Simulate network delay to the backend
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, a fetch() call to your backend would be here.
    // We return a mock success response to simulate a successful API call from the backend.
    const mockResponse = {
        retCode: 0,
        retMsg: 'OK',
        result: {
            orderId: `mock_${crypto.randomUUID()}`,
            orderLinkId: `mock_link_${Date.now()}`,
        },
        retExtInfo: {},
        time: Date.now(),
    };

    console.log('--- Mock Success Response Received ---', mockResponse);
    return mockResponse;
}

/**
 * Simulates closing an open position via the secure backend.
 */
export async function closeBybitPosition(
    symbol: string,
    quantity: string,
    side: 'Buy' | 'Sell'
): Promise<any> {
    console.log('--- Closing position via secure backend (MOCKED) ---');
    console.log('Close Details:', { symbol, quantity, side });

    // Simulate network delay for closing order
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockResponse = {
        retCode: 0,
        retMsg: 'OK',
        result: { orderId: `mock_close_${crypto.randomUUID()}` },
        time: Date.now(),
    };
    
    console.log('--- Mock Close Response Received ---', mockResponse);
    return mockResponse;
}


/**
 * Simulates modifying an existing order (e.g., updating TP/SL) via the secure backend.
 */
export async function modifyBybitTrade(
    orderId: string,
    symbol: string,
    takeProfit?: string,
    stopLoss?: string
): Promise<any> {
    console.log('--- Modifying trade via secure backend (MOCKED) ---');
    console.log('Modification Details:', { orderId, symbol, takeProfit, stopLoss });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockResponse = {
        retCode: 0,
        retMsg: "OK",
        result: {
            orderId: orderId,
        },
        time: Date.now()
    };

    console.log('--- Mock Modification Response Received ---', mockResponse);
    return mockResponse;
}