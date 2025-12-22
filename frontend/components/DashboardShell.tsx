"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

interface DashboardShellProps {
    children: ReactNode;
    onUploadNew: () => void;
    activeTab: "health" | "stats";
    setActiveTab: (tab: "health" | "stats") => void;
    onLibrarySelect?: (libraryId: number) => void;
}

export default function DashboardShell({ children, onUploadNew, activeTab, setActiveTab, onLibrarySelect }: DashboardShellProps) {
    return (
        <div className="bg-[#020617] min-h-screen flex font-sans overflow-hidden selection:bg-purple-500/30">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLibrarySelect={onLibrarySelect} />

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
                            <h1 className="text-2xl font-bold text-white tracking-tight">Rekorded</h1>
                            <p className="text-slate-400 text-sm">
                                {activeTab === "health" ? "Health Check" : "Library Stats"}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={onUploadNew}
                            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            Upload New
                        </button>
                        <SignedIn>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-full transition-colors shadow-lg shadow-blue-500/20">
                                    Sign in to Save
                                </button>
                            </SignInButton>
                        </SignedOut>
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
