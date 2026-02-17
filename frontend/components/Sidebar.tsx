"use client";

import { Activity, BarChart2, Disc3, Clock, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface SidebarProps {
    activeTab: "health" | "stats";
    setActiveTab: (tab: "health" | "stats") => void;
    onLibrarySelect?: (libraryId: number) => void;
}

interface Library {
    id: number;
    upload_date: string;
    total_tracks: number;
    filename: string;
}

export default function Sidebar({ activeTab, setActiveTab, onLibrarySelect }: SidebarProps) {
    const { getToken, isSignedIn } = useAuth();
    const [libraries, setLibraries] = useState<Library[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (isSignedIn) {
            fetchLibraries();
        }
    }, [isSignedIn]);

    const fetchLibraries = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')}/libraries`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setLibraries(data);
            }
        } catch (error) {
            console.error("Failed to fetch libraries:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteLibrary = async (libraryId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this library?")) return;

        try {
            const token = await getToken();
            const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')}/libraries/${libraryId}`, {
                method: "DELETE",
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (res.ok) {
                setLibraries(libraries.filter(lib => lib.id !== libraryId));
            }
        } catch (error) {
            console.error("Failed to delete library:", error);
        }
    };

    const navItems: Array<{ id: "health" | "stats"; icon: typeof Activity; label: string }> = [
        { id: "health", icon: Activity, label: "Health" },
        { id: "stats", icon: BarChart2, label: "Insights" },
    ];

    return (
        <div className={`hidden lg:flex flex-col border-r border-[var(--border)] bg-[var(--background)] h-screen sticky top-0 z-50 transition-all duration-200 ${isCollapsed ? "w-16" : "w-56"}`}>
            {/* Logo */}
            <div className="h-14 flex items-center justify-between w-full border-b border-[var(--border)] px-4">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <Disc3 className="text-blue-500 w-4 h-4 animate-spin-slow" />
                        <span className="text-sm font-semibold text-white">Rekorded</span>
                    </div>
                )}
                {isCollapsed && (
                    <div className="mx-auto">
                        <Disc3 className="text-blue-500 w-4 h-4 animate-spin-slow" />
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 hover:bg-white/5 rounded transition-colors"
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                    ) : (
                        <ChevronLeft className="w-3.5 h-3.5 text-zinc-600" />
                    )}
                </button>
            </div>

            {/* Nav */}
            <nav className={`flex flex-col gap-1 mt-4 ${isCollapsed ? "px-2" : "px-3"}`}>
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`p-2.5 rounded-lg flex items-center gap-2.5 transition-colors text-sm ${
                                isActive
                                    ? "text-white bg-white/[0.06]"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                            } ${isCollapsed ? "justify-center" : ""}`}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon className="w-4 h-4 shrink-0" />
                            {!isCollapsed && <span className="font-medium">{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            {/* History */}
            {isSignedIn && !isCollapsed && (
                <div className="flex-1 flex flex-col mt-6 px-3 overflow-hidden">
                    <div className="flex items-center gap-2 text-zinc-600 mb-2 px-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium uppercase tracking-wider">History</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-0.5">
                        {loading ? (
                            <p className="text-xs text-zinc-600 px-1">Loading...</p>
                        ) : libraries.length === 0 ? (
                            <p className="text-xs text-zinc-600 px-1">No uploads yet</p>
                        ) : (
                            libraries.map((lib) => (
                                <div key={lib.id} className="group relative">
                                    <button
                                        onClick={() => onLibrarySelect?.(lib.id)}
                                        className="w-full text-left px-2 py-2 rounded-md hover:bg-white/[0.03] transition-colors"
                                    >
                                        <p className="text-xs text-zinc-400 group-hover:text-zinc-200 truncate">
                                            {lib.filename}
                                        </p>
                                        <p className="text-[11px] text-zinc-600">
                                            {new Date(lib.upload_date).toLocaleDateString()} · {lib.total_tracks} tracks
                                        </p>
                                    </button>
                                    <button
                                        onClick={(e) => deleteLibrary(lib.id, e)}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3 h-3 text-red-400/70" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}