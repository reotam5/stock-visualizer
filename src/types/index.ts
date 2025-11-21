export interface Stock {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

export interface PortfolioItem {
    stock: Stock;
    allocation: number; // Percentage 0-100
}

export interface HistoricalDataPoint {
    date: string;
    value: number;
}

export interface PortfolioHistory {
    symbol: string;
    data: HistoricalDataPoint[];
}
