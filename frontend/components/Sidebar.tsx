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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/libraries`, {
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/libraries/${libraryId}`, {
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
        <div className={`hidden lg:flex flex-col border-r border-white/5 bg-[#020617] h-screen sticky top-0 z-50 transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"
            }`}>
            {/* Logo */}
            <div className="h-20 flex items-center justify-between w-full border-b border-white/5 bg-[#020617] px-6">
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <div className="relative group cursor-pointer">
                            <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                            <Disc3 className="text-white w-6 h-6 animate-spin-slow relative z-10" />
                        </div>
                        <span className="text-lg font-bold text-white">Rekorded</span>
                    </div>
                )}
                {isCollapsed && (
                    <div className="relative group cursor-pointer mx-auto">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                        <Disc3 className="text-white w-6 h-6 animate-spin-slow relative z-10" />
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                    ) : (
                        <ChevronLeft className="w-4 h-4 text-slate-400" />
                    )}
                </button>
            </div>

            {/* Nav Items */}
            <nav className={`flex flex-col gap-2 mt-6 ${isCollapsed ? "px-2" : "px-4"}`}>
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`relative group p-3 rounded-lg flex items-center gap-3 transition-all ${isActive
                                ? "text-white bg-white/10"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                } ${isCollapsed ? "justify-center" : ""}`}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            {/* History Section */}
            {isSignedIn && !isCollapsed && (
                <div className="flex-1 flex flex-col mt-6 px-4 overflow-hidden">
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">History</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {loading ? (
                            <p className="text-xs text-slate-500">Loading...</p>
                        ) : libraries.length === 0 ? (
                            <p className="text-xs text-slate-500">No uploads yet</p>
                        ) : (
                            libraries.map((lib) => (
                                <div
                                    key={lib.id}
                                    className="group relative"
                                >
                                    <button
                                        onClick={() => onLibrarySelect?.(lib.id)}
                                        className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <p className="text-xs text-slate-300 group-hover:text-white truncate">
                                            {lib.filename}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(lib.upload_date).toLocaleDateString()} · {lib.total_tracks} tracks
                                        </p>
                                    </button>
                                    <button
                                        onClick={(e) => deleteLibrary(lib.id, e)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3 h-3 text-red-400" />
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
