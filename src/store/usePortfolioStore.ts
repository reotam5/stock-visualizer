import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PortfolioItem, Stock } from '../types';

interface PortfolioState {
    items: PortfolioItem[];
    apiKey: string;
    setApiKey: (key: string) => void;
    addItem: (stock: Stock, allocation: number) => void;
    removeItem: (symbol: string) => void;
    updateAllocation: (symbol: string, allocation: number) => void;
    clearPortfolio: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
    persist(
        (set) => ({
            items: [],
            apiKey: import.meta.env.VITE_FINNHUB_API_KEY || '',
            setApiKey: (apiKey) => set({ apiKey }),
            addItem: (stock, allocation) => set((state) => {
                // Check if exists
                if (state.items.find(item => item.stock.symbol === stock.symbol)) {
                    return state;
                }
                return { items: [...state.items, { stock, allocation }] };
            }),
            removeItem: (symbol) => set((state) => ({
                items: state.items.filter(item => item.stock.symbol !== symbol)
            })),
            updateAllocation: (symbol, allocation) => set((state) => ({
                items: state.items.map(item =>
                    item.stock.symbol === symbol ? { ...item, allocation } : item
                )
            })),
            clearPortfolio: () => set({ items: [] }),
        }),
        {
            name: 'portfolio-storage',
        }
    )
);
