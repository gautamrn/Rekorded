"use client";

import { useState, useMemo } from 'react';
import { Track } from "../types";
import { AlertTriangle, XCircle, Search, Filter, Layers, Disc3 } from "lucide-react";
import { motion } from "framer-motion";

interface TrackTableProps {
    tracks: Track[];
    playlistFilter: string;
}

export default function TrackTable({ tracks, playlistFilter }: TrackTableProps) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const filteredTracks = useMemo(() => {
        return tracks.filter((track) => {
            const matchesSearch =
                track.name.toLowerCase().includes(search.toLowerCase()) ||
                track.artist.toLowerCase().includes(search.toLowerCase());

            if (!matchesSearch) return false;

            if (filter !== "all") {
                if (!track.issues.some(i => i.issue_type === filter)) return false;
            }

            // Global playlist filter is already applied to 'tracks' prop in page.tsx
            // but we keep the logic here for robustness if needed, 
            // though it's redundant now since the data passed is already filtered.

            return true;
        });
    }, [tracks, search, filter]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[700px]"
        >
            {/* Header */}
            <div className="p-6 border-b border-white/5 space-y-4 bg-white/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">USB Health Check</h3>
                        <p className="text-sm text-slate-400">Audit your export before you play</p>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search artist or title..."
                                className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium placeholder:text-slate-600"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <select
                                className="bg-[#0f172a]/50 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Issues</option>
                                <option value="Low Bitrate">Low Bitrate</option>
                                <option value="Missing Cues">Missing Cues</option>
                                <option value="Broken Link">Broken Link</option>
                                <option value="Duplicate">Duplicate</option>
                                <option value="Dynamic Tempo">Dynamic Tempo</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#020617]/90 sticky top-0 z-10 backdrop-blur-md border-b border-white/5">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Track Details</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Format</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Playlists</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Issues detected</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Bitrate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredTracks.map((track) => (
                            <tr key={track.track_id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 max-w-[300px]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                                            <Disc3 className="w-4 h-4" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="font-semibold text-slate-200 truncate group-hover:text-white transition-colors">{track.name}</div>
                                            <div className="text-sm text-slate-500 truncate">{track.artist}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-slate-400">
                                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-medium text-slate-300">
                                        {track.kind.split(' ')[0]}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        {track.playlists.slice(0, 2).map((p, i) => (
                                            <span key={i} className="text-xs text-slate-400 truncate max-w-[150px] block" title={p}>
                                                {p.split('/').pop()}
                                            </span>
                                        ))}
                                        {track.playlists.length > 2 && (
                                            <span className="text-[10px] text-slate-600">+{track.playlists.length - 2} more</span>
                                        )}
                                        {track.playlists.length === 0 && <span className="text-xs text-slate-600">-</span>}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {track.issues.map((issue, idx) => {
                                            const isError = issue.severity === 'error';
                                            const colorClass = isError
                                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}
                                                    title={issue.description}
                                                >
                                                    {isError ? <XCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                                    {issue.issue_type}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-slate-400 text-right font-mono">
                                    <span className={track.bitrate < 320 && track.bitrate > 0 ? "text-amber-500" : ""}>
                                        {track.bitrate > 0 ? `${track.bitrate}` : '-'}
                                    </span>
                                    <span className="text-slate-600 text-xs ml-1">kbps</span>
                                </td>
                            </tr>
                        ))}

                        {filteredTracks.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-500">
                                    No tracks found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
