"use client";

import { Activity, BarChart2, Disc3 } from "lucide-react";

interface SidebarProps {
    activeTab: "health" | "stats";
    setActiveTab: (tab: "health" | "stats") => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
    const navItems = [
        { id: "health", icon: Activity, label: "Health" },
        { id: "stats", icon: BarChart2, label: "Insights" },
    ];

    return (
        <div className="hidden lg:flex w-20 flex-col items-center border-r border-white/5 bg-[#020617] h-screen sticky top-0 z-50">
            {/* Logo */}
            <div className="h-20 flex items-center justify-center w-full border-b border-white/5 bg-[#020617]">
                <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                    <Disc3 className="text-white w-6 h-6 animate-spin-slow relative z-10" />
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 flex flex-col items-center gap-6 mt-8 w-full">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className="relative group p-3 w-full flex justify-center"
                            title={item.label}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-purple-500 rounded-r-full shadow-[0_0_12px_2px_rgba(168,85,247,0.6)]" />
                            )}

                            <div className={`p-2 rounded-xl transition-all duration-300 ${isActive
                                ? "text-white bg-white/5"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                }`}>
                                <item.icon className="w-5 h-5 stroke-[1.5px]" />
                            </div>
                        </button>
                    );
                })}
            </nav>

            {/* Avatar / Bottom Action */}
            <div className="pb-8">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">JD</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
