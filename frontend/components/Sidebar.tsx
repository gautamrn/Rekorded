"use client";

import { LayoutDashboard, Music2, Activity, Settings, Disc3 } from "lucide-react";

export default function Sidebar() {
    const navItems = [
        { icon: LayoutDashboard, label: "Overview", active: true },
        { icon: Music2, label: "Library", active: false },
        { icon: Activity, label: "Health", active: false },
        { icon: Settings, label: "Settings", active: false },
    ];

    return (
        <div className="hidden lg:flex w-64 flex-col border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl h-screen sticky top-0">
            <div className="h-20 flex items-center px-8 border-b border-slate-800/50">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mr-3">
                    <Disc3 className="text-white w-5 h-5 animate-spin-slow" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">Rekorded</span>
            </div>

            <nav className="flex-1 p-6 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${item.active
                                ? "bg-blue-600/10 text-blue-400 shadow-inner"
                                : "text-slate-400 hover:text-white hover:bg-slate-900"
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-6">
                <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-500/10">
                    <h4 className="text-sm font-semibold text-white mb-1">Pro Plan</h4>
                    <p className="text-xs text-slate-400 mb-3">Unlock advanced metrics</p>
                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors">
                        Upgrade
                    </button>
                </div>
            </div>
        </div>
    );
}
