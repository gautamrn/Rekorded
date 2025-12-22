"use client";

import { LayoutDashboard, Music2, Activity, Settings, Disc3 } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
    const [active, setActive] = useState("Overview");

    const navItems = [
        { icon: LayoutDashboard, label: "Overview" },
        { icon: Music2, label: "Library" },
        { icon: Activity, label: "Health" },
        { icon: Settings, label: "Settings" },
    ];

    return (
        <div className="hidden lg:flex w-20 flex-col items-center border-r border-white/5 bg-[#020617] h-screen sticky top-0 z-50">
            <div className="h-20 flex items-center justify-center w-full border-b border-white/5 bg-[#020617]">
                <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                    <Disc3 className="text-white w-6 h-6 animate-spin-slow relative z-10" />
                </div>
            </div>

            <nav className="flex-1 flex flex-col items-center gap-6 mt-8 w-full">
                {navItems.map((item) => {
                    const isActive = active === item.label;
                    return (
                        <button
                            key={item.label}
                            onClick={() => setActive(item.label)}
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

            <div className="pb-8">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px]">
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">JD</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
