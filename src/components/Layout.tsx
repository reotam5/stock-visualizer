import React from 'react';
import { LayoutDashboard, TrendingUp } from 'lucide-react';

import { SettingsDialog } from './SettingsDialog';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30">
            <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                StockViz
                            </span>
                        </div>
                        <div className="flex gap-4 text-sm font-medium text-slate-400 items-center">
                            <a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </a>
                            <SettingsDialog />
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};
