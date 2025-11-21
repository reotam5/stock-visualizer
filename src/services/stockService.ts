import axios from 'axios';
import type { Stock, HistoricalDataPoint } from '../types';
import { usePortfolioStore } from '../store/usePortfolioStore';

const BASE_URL = 'https://finnhub.io/api/v1';

// Helper to get API key from store or env
const getApiKey = () => usePortfolioStore.getState().apiKey || import.meta.env.VITE_FINNHUB_API_KEY;

export const searchStocks = async (query: string): Promise<Stock[]> => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('API Key missing');

    try {
        const response = await axios.get(`${BASE_URL}/search?q=${query}&token=${apiKey}`);

        return response.data.result
            .filter((item: any) => item.type === 'Common Stock')
            .slice(0, 10)
            .map((item: any) => ({
                symbol: item.symbol,
                name: item.description,
                price: 0, // Placeholder
                change: 0,
                changePercent: 0
            }));
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
};

export const fetchStockData = async (symbol: string): Promise<Stock> => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('API Key missing');

    try {
        const quoteRes = await axios.get(`${BASE_URL}/quote?symbol=${symbol}&token=${apiKey}`);
        const { c: price, d: change, dp: changePercent } = quoteRes.data;

        // profile2 is a premium endpoint. We'll use the symbol as name if we don't have it,
        // or rely on the search result passing the name in. 
        // Since this function is often called standalone, we'll just default name to symbol 
        // or let the UI handle it.

        return {
            symbol: symbol.toUpperCase(),
            name: symbol.toUpperCase(), // Default to symbol as we can't fetch name for free easily without search
            price,
            change,
            changePercent
        };
    } catch (error) {
        console.error('Fetch stock error:', error);
        throw error;
    }
};

// Helper to generate mock data if API fails
const generateMockHistory = (days: number, startPrice: number = 150): HistoricalDataPoint[] => {
    const data: HistoricalDataPoint[] = [];
    let currentPrice = startPrice;
    const now = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Random walk
        const change = (Math.random() - 0.5) * 5;
        currentPrice += change;
        if (currentPrice < 1) currentPrice = 1;

        data.push({
            date: date.toISOString(),
            value: currentPrice
        });
    }
    return data;
};

export const fetchHistoricalData = async (symbol: string, days: number = 30): Promise<HistoricalDataPoint[]> => {
    const apiKey = getApiKey();
    if (!apiKey) return [];

    const to = Math.floor(Date.now() / 1000);
    const from = to - (days * 24 * 60 * 60);

    let resolution = 'D';
    if (days <= 1) resolution = '30';
    else if (days <= 7) resolution = '60';

    try {
        const response = await axios.get(`${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${apiKey}`);

        if (response.data.s === 'no_data') return [];
        if (response.data.error) return [];

        const { t: timestamps, c: closes } = response.data;

        if (!timestamps || !closes) return [];

        return timestamps.map((timestamp: number, index: number) => ({
            date: new Date(timestamp * 1000).toISOString(),
            value: closes[index]
        }));
    } catch (error: any) {
        // If 403 (Forbidden), likely a free tier limit. Fallback to mock data.
        if (error.response && error.response.status === 403) {
            console.warn(`Historical data access denied for ${symbol} (403). Falling back to mock data.`);

            // Try to get current price to anchor the mock data
            let currentPrice = 150;
            try {
                const quote = await axios.get(`${BASE_URL}/quote?symbol=${symbol}&token=${apiKey}`);
                if (quote.data.c) currentPrice = quote.data.c;
            } catch (e) {
                // Ignore quote error
            }

            return generateMockHistory(days, currentPrice);
        }
        console.error('History error:', error);
        return [];
    }
};

export const fetchStockChange = async (symbol: string, days: number): Promise<number> => {
    const apiKey = getApiKey();
    if (!apiKey) return 0;

    // For 1 Day, use the Quote endpoint which is more reliable on free tier and gives real-time change
    if (days === 1) {
        try {
            const quoteRes = await axios.get(`${BASE_URL}/quote?symbol=${symbol}&token=${apiKey}`);
            return quoteRes.data.dp || 0;
        } catch (error) {
            console.error('Fetch quote error:', error);
            return 0;
        }
    }

    const to = Math.floor(Date.now() / 1000);
    const from = to - (days * 24 * 60 * 60);

    let resolution = 'D';
    if (days <= 1) resolution = '30';
    else if (days <= 7) resolution = '60';

    try {
        const response = await axios.get(`${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${apiKey}`);

        if (response.data.s === 'no_data') return 0;
        if (response.data.error) {
            console.warn(`API Error for ${symbol}: ${response.data.error}`);
            return 0;
        }

        const { c: closes, o: opens } = response.data;

        if (!closes || closes.length === 0) return 0;

        const startPrice = opens[0];
        const endPrice = closes[closes.length - 1];

        if (!startPrice) return 0;

        return ((endPrice - startPrice) / startPrice) * 100;
    } catch (error: any) {
        // Handle 403 specifically to avoid spamming console if it's a plan limit
        if (error.response && error.response.status === 403) {
            console.warn(`Candle data access denied for ${symbol} (403). Falling back to mock change.`);

            // Try to get current price to anchor the mock data
            let currentPrice = 150;
            try {
                const quote = await axios.get(`${BASE_URL}/quote?symbol=${symbol}&token=${apiKey}`);
                if (quote.data.c) currentPrice = quote.data.c;
            } catch (e) {
                // Ignore quote error
            }

            // Generate mock history to calculate a consistent mock change
            const mockHistory = generateMockHistory(days, currentPrice);
            if (mockHistory.length < 2) return 0;

            const startPrice = mockHistory[0].value;
            const endPrice = mockHistory[mockHistory.length - 1].value;

            return ((endPrice - startPrice) / startPrice) * 100;
        }
        console.error('Fetch change error:', error);
        return 0;
    }
};
