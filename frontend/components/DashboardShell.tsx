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
        <div className="bg-[var(--background)] min-h-screen flex font-sans overflow-hidden">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLibrarySelect={onLibrarySelect} />

            <main className="flex-1 relative flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="relative z-10 flex justify-between items-center px-8 py-4 border-b border-[var(--border)]">
                    <div>
                        <h1 className="text-lg font-semibold text-white tracking-tight">
                            {activeTab === "health" ? "Health Check" : "Insights"}
                        </h1>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={onUploadNew}
                            className="px-3 py-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
                        >
                            New upload
                        </button>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
                                    Sign in to save
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto z-10 p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-7xl mx-auto space-y-6 pb-12"
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}