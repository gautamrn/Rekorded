"use client";

import { useState, useMemo } from 'react';
import { Track } from "../types";
import { AlertTriangle, XCircle, Search, Filter, Layers } from "lucide-react";
import { motion } from "framer-motion";

interface TrackTableProps {
    tracks: Track[];
}

export default function TrackTable({ tracks }: TrackTableProps) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [playlistFilter, setPlaylistFilter] = useState("all");

    const allPlaylists = useMemo(() => {
        const s = new Set<string>();
        tracks.forEach(t => t.playlists.forEach(p => s.add(p)));
        return Array.from(s).sort();
    }, [tracks]);

    const filteredTracks = useMemo(() => {
        return tracks.filter((track) => {
            const matchesSearch =
                track.name.toLowerCase().includes(search.toLowerCase()) ||
                track.artist.toLowerCase().includes(search.toLowerCase());

            if (!matchesSearch) return false;

            if (filter !== "all") {
                if (!track.issues.some(i => i.issue_type === filter)) return false;
            }

            if (playlistFilter !== "all") {
                if (!track.playlists.includes(playlistFilter)) return false;
            }

            return true;
        });
    }, [tracks, search, filter, playlistFilter]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-slate-900/50 rounded-2xl border border-white/5 backdrop-blur-md overflow-hidden flex flex-col h-[700px] shadow-xl"
        >
            {/* Header */}
            <div className="p-6 border-b border-slate-800/50 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Library Audit</h3>
                        <p className="text-sm text-slate-400">Found issues and flagged tracks</p>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search artist or title..."
                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <select
                                className="bg-slate-950/50 border border-slate-700/50 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
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

                        <div className="relative">
                            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <select
                                className="bg-slate-950/50 border border-slate-700/50 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer max-w-[200px]"
                                value={playlistFilter}
                                onChange={(e) => setPlaylistFilter(e.target.value)}
                            >
                                <option value="all">All Playlists</option>
                                {allPlaylists.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-950/80 sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Track Details</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Format</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Playlists</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Issues detected</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Bitrate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {filteredTracks.map((track) => (
                            <tr key={track.track_id} className="hover:bg-blue-500/5 transition-colors group">
                                <td className="p-4 max-w-[300px]">
                                    <div className="font-semibold text-slate-200 truncate">{track.name}</div>
                                    <div className="text-sm text-slate-500 truncate">{track.artist}</div>
                                </td>
                                <td className="p-4 text-sm text-slate-400">
                                    <span className="px-2.5 py-1 rounded-md bg-slate-800/50 border border-slate-700/50 text-xs font-medium">
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
                                    {track.bitrate > 0 ? `${track.bitrate}` : '-'} <span className="text-slate-600 text-xs">kbps</span>
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
