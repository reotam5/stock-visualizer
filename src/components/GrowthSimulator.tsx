import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { fetchHistoricalData } from '../services/stockService';
import type { HistoricalDataPoint } from '../types';
import { Calculator } from 'lucide-react';

export const GrowthSimulator: React.FC = () => {
    const { items, apiKey } = usePortfolioStore();
    const [initialAmount, setInitialAmount] = useState(10000);
    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [days, setDays] = useState(30);

    useEffect(() => {
        const generateData = async () => {
            if (items.length === 0 || !apiKey) {
                setChartData([]);
                return;
            }

            setIsLoading(true);

            // Fetch history for all stocks
            const histories: Record<string, HistoricalDataPoint[]> = {};
            for (const item of items) {
                if (item.allocation > 0) {
                    histories[item.stock.symbol] = await fetchHistoricalData(item.stock.symbol, days);
                }
            }

            // Combine data
            // Assuming all histories have same dates for simplicity (mock data does)
            const combinedData: any[] = [];
            const firstSymbol = Object.keys(histories)[0];
            if (!firstSymbol) {
                setIsLoading(false);
                return;
            }

            const dates = histories[firstSymbol].map(d => d.date);

            dates.forEach((date, index) => {
                let totalValue = 0;

                items.forEach(item => {
                    if (item.allocation > 0 && histories[item.stock.symbol]) {
                        const stockHistory = histories[item.stock.symbol];
                        // Find closest date match if lengths differ (simple index match for now)
                        const priceAtDate = stockHistory[index]?.value || 0;

                        const startPrice = stockHistory[0].value;
                        const allocatedAmount = initialAmount * (item.allocation / 100);
                        const shares = allocatedAmount / startPrice;

                        totalValue += shares * priceAtDate;
                    }
                });

                combinedData.push({
                    date,
                    value: Math.round(totalValue)
                });
            });

            setChartData(combinedData);
            setIsLoading(false);
        };

        generateData();
    }, [items, initialAmount, days, apiKey]);

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-400" /> Growth Simulator
                </h2>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                        {[
                            { label: '1M', value: 30 },
                            { label: '3M', value: 90 },
                            { label: '1Y', value: 365 },
                            { label: '5Y', value: 1825 },
                        ].map((range) => (
                            <button
                                key={range.label}
                                onClick={() => setDays(range.value)}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${days === range.value
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-sm text-slate-400">Initial: $</span>
                        <input
                            type="number"
                            value={initialAmount}
                            onChange={(e) => setInitialAmount(Number(e.target.value))}
                            className="bg-transparent w-20 focus:outline-none font-mono text-slate-200 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full">
                {!apiKey ? (
                    <div className="h-full flex items-center justify-center text-amber-500 border-2 border-dashed border-slate-800 rounded-lg">
                        Please set your API Key in Settings
                    </div>
                ) : items.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
                        Add assets to simulate growth
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-lg p-4 text-center">
                        <p>No historical data available.</p>
                        <p className="text-xs mt-2">Your API plan may not support candle data.</p>
                    </div>
                ) : isLoading ? (
                    <div className="h-full flex items-center justify-center text-blue-400">
                        Calculating growth...
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis
                                dataKey="date"
                                stroke="#64748b"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(val) => {
                                    const d = new Date(val);
                                    return days <= 30
                                        ? `${d.getMonth() + 1}/${d.getDate()}`
                                        : `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
                                }}
                            />
                            <YAxis
                                stroke="#64748b"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(val) => `$${val}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                                itemStyle={{ color: '#60a5fa' }}
                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: '#60a5fa' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};
