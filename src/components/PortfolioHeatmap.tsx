import React, { useState, useEffect } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { fetchStockChange } from '../services/stockService';

const CustomContent = (props: any) => {
    const { x, y, width, height, name, change = 0 } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: change >= 0 ? '#10b981' : '#ef4444', // Green for positive, Red for negative
                    stroke: '#0f172a',
                    strokeWidth: 2,
                    strokeOpacity: 1,
                }}
            />
            {width > 50 && height > 50 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={14}
                    fontWeight="bold"
                >
                    {name}
                </text>
            )}
            {width > 50 && height > 50 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 20}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={12}
                >
                    {change > 0 ? '+' : ''}{change.toFixed(2)}%
                </text>
            )}
        </g>
    );
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const change = data.change || 0;
        return (
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl">
                <p className="font-bold text-slate-200">{data.name}</p>
                <p className="text-sm text-slate-400">Allocation: {data.value}%</p>
                <p className={`text-sm font-mono ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    Change: {change > 0 ? '+' : ''}{change.toFixed(2)}%
                </p>
            </div>
        );
    }
    return null;
};

export const PortfolioHeatmap: React.FC = () => {
    const { items, apiKey } = usePortfolioStore();
    const [timeRange, setTimeRange] = useState(1); // Default 1 Day
    const [heatmapData, setHeatmapData] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (!apiKey) return;

            const promises = items.map(async (item) => {
                const change = await fetchStockChange(item.stock.symbol, timeRange);
                return {
                    name: item.stock.symbol,
                    value: item.allocation,
                    change
                };
            });

            const results = await Promise.all(promises);
            setHeatmapData(results.filter(item => item.value > 0));
        };

        loadData();
    }, [items, timeRange, apiKey]);

    if (items.length === 0) {
        return (
            <div className="h-[400px] bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                Add stocks with allocation to view heatmap
            </div>
        );
    }

    return (
        <div className="h-[400px] bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-sm overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-200">Portfolio Heatmap</h2>
                <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                    {[
                        { label: '1D', value: 1 },
                        { label: '1W', value: 7 },
                        { label: '1M', value: 30 },
                        { label: '1Y', value: 365 },
                    ].map((range) => (
                        <button
                            key={range.label}
                            onClick={() => setTimeRange(range.value)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${timeRange === range.value
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {!apiKey ? (
                <div className="flex-1 flex items-center justify-center text-amber-500 border-2 border-dashed border-slate-800 rounded-lg">
                    Please set your API Key in Settings
                </div>
            ) : (
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={heatmapData}
                            dataKey="value"
                            aspectRatio={4 / 3}
                            stroke="#fff"
                            fill="#8884d8"
                            content={<CustomContent />}
                        >
                            <Tooltip content={<CustomTooltip />} />
                        </Treemap>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};
