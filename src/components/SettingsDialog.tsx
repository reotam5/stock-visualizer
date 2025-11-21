import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X, Key } from 'lucide-react';
import { usePortfolioStore } from '../store/usePortfolioStore';

export const SettingsDialog: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { apiKey, setApiKey } = usePortfolioStore();
    const [tempKey, setTempKey] = useState(apiKey);

    const handleSave = () => {
        setApiKey(tempKey);
        setIsOpen(false);
    };

    const handleOpen = () => {
        setTempKey(apiKey);
        setIsOpen(true);
    };

    return (
        <>
            <button
                onClick={handleOpen}
                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Settings"
            >
                <Settings className="w-5 h-5" />
            </button>

            {isOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-blue-400" /> Settings
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Finnhub API Key
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="password"
                                        value={tempKey}
                                        onChange={(e) => setTempKey(e.target.value)}
                                        placeholder="Enter your API key"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-200"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-slate-500">
                                    Get a free API key from <a href="https://finnhub.io/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">finnhub.io</a>
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
