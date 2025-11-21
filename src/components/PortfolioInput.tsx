import React, { useState } from 'react';
import { Plus, Trash2, Search, AlertCircle } from 'lucide-react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { searchStocks, fetchStockData } from '../services/stockService';
import type { Stock } from '../types';

export const PortfolioInput: React.FC = () => {
    const { items, addItem, removeItem, updateAllocation } = usePortfolioStore();
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Stock[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setError('');
        try {
            const results = await searchStocks(query);
            setSearchResults(results);
            if (results.length === 0) {
                // If no search results, try to fetch directly (maybe it's a valid symbol not in mock list)
                try {
                    const directStock = await fetchStockData(query);
                    setSearchResults([directStock]);
                } catch (err) {
                    setError('No stocks found');
                }
            }
        } catch (err) {
            setError('Failed to search stocks');
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddStock = (stock: Stock) => {
        addItem(stock, 0);
        setQuery('');
        setSearchResults([]);
    };

    const totalAllocation = items.reduce((sum, item) => sum + item.allocation, 0);

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" /> Add Assets
            </h2>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative mb-6">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search symbol (e.g. AAPL)..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                        {searchResults.map(stock => (
                            <button
                                key={stock.symbol}
                                onClick={() => handleAddStock(stock)}
                                className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex justify-between items-center group"
                            >
                                <div>
                                    <div className="font-bold text-slate-200">{stock.symbol}</div>
                                    <div className="text-xs text-slate-500">{stock.name}</div>
                                </div>
                                <div className="text-sm font-mono text-slate-400 group-hover:text-blue-400">
                                    ${stock.price.toFixed(2)}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
                {error && <div className="mt-2 text-red-400 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {error}</div>}
            </form>

            {/* Portfolio List */}
            <div className="space-y-3">
                {items.map((item) => (
                    <div key={item.stock.symbol} className="flex items-center gap-4 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                        <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-800">
                            {item.stock.symbol[0]}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-slate-200">{item.stock.symbol}</div>
                            <div className="text-xs text-slate-500">{item.stock.name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-slate-500 mb-1">Allocation %</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={item.allocation}
                                    onChange={(e) => updateAllocation(item.stock.symbol, Number(e.target.value))}
                                    className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-right text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <button
                                onClick={() => removeItem(item.stock.symbol)}
                                className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {items.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-lg">
                        No assets added yet. Search to build your portfolio.
                    </div>
                )}
            </div>

            {/* Allocation Summary */}
            {items.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-sm text-slate-400">Total Allocation</span>
                    <span className={`font-mono font-bold ${totalAllocation === 100 ? 'text-green-400' : totalAllocation > 100 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {totalAllocation}%
                    </span>
                </div>
            )}
        </div>
    );
};
