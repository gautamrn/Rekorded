"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";

interface DashboardShellProps {
    children: ReactNode;
    onUploadNew: () => void;
    activeTab: "health" | "stats";
    setActiveTab: (tab: "health" | "stats") => void;
}

export default function DashboardShell({ children, onUploadNew, activeTab, setActiveTab }: DashboardShellProps) {
    return (
        <div className="bg-[#020617] min-h-screen flex font-sans overflow-hidden selection:bg-purple-500/30">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content Area */}
            <main className="flex-1 relative flex flex-col h-screen overflow-hidden">

                {/* Subtle Grid Background */}
                <div className="absolute inset-0 pointer-events-none z-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />

                {/* Top Header */}
                <header className="relative z-10 flex justify-between items-center px-8 py-6 border-b border-white/5 bg-[#020617]/50 backdrop-blur-sm">
                    <div className="flex items-center gap-12">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">USB Health Check</h1>
                            <p className="text-slate-400 text-sm">Audit your export before you play.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={onUploadNew}
                            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            Upload New
                        </button>
                        <button className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-transform">
                            Export Report
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto z-10 p-8 scroll-smooth">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, staggerChildren: 0.1 }}
                        className="max-w-7xl mx-auto space-y-8 pb-12"
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
