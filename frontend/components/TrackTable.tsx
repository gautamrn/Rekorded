"use client";

import { useState, useMemo } from 'react';
import { Track } from "../types";
import { AlertTriangle, XCircle, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";

interface TrackTableProps {
    tracks: Track[];
    playlistFilter: string;
}

export default function TrackTable({ tracks }: TrackTableProps) {
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

            return true;
        });
    }, [tracks, search, filter]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="card overflow-hidden flex flex-col h-[650px]"
        >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[var(--border)] space-y-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                        <h3 className="text-sm font-medium text-white">Track Health</h3>
                        <p className="text-xs text-zinc-600 mt-0.5">{filteredTracks.length} of {tracks.length} tracks</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-56">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg py-1.5 pl-8 pr-3 text-sm text-zinc-300 focus:outline-none focus:border-blue-500/40 transition-colors placeholder:text-zinc-700"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                            <select
                                className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg pl-8 pr-6 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-500/40 appearance-none cursor-pointer hover:border-[var(--border-hover)] transition-colors"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All</option>
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
                    <thead className="bg-[var(--surface)] sticky top-0 z-10 border-b border-[var(--border)]">
                        <tr>
                            <th className="px-5 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Track</th>
                            <th className="px-5 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Format</th>
                            <th className="px-5 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Playlists</th>
                            <th className="px-5 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Issues</th>
                            <th className="px-5 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider text-right">Bitrate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {filteredTracks.map((track) => (
                            <tr key={track.track_id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-5 py-3 max-w-[280px]">
                                    <div className="overflow-hidden">
                                        <div className="text-sm font-medium text-zinc-200 truncate">{track.name}</div>
                                        <div className="text-xs text-zinc-600 truncate">{track.artist}</div>
                                    </div>
                                </td>
                                <td className="px-5 py-3">
                                    <span className="text-xs text-zinc-400">
                                        {track.kind.split(' ')[0]}
                                    </span>
                                </td>
                                <td className="px-5 py-3">
                                    <div className="flex flex-col gap-0.5">
                                        {track.playlists.slice(0, 2).map((p, i) => (
                                            <span key={i} className="text-xs text-zinc-500 truncate max-w-[140px] block" title={p}>
                                                {p.split('/').pop()}
                                            </span>
                                        ))}
                                        {track.playlists.length > 2 && (
                                            <span className="text-[10px] text-zinc-700">+{track.playlists.length - 2}</span>
                                        )}
                                        {track.playlists.length === 0 && <span className="text-xs text-zinc-700">-</span>}
                                    </div>
                                </td>
                                <td className="px-5 py-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {track.issues.map((issue, idx) => {
                                            const isError = issue.severity === 'error';
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                                                        isError
                                                            ? 'bg-red-500/[0.08] text-red-400'
                                                            : 'bg-amber-500/[0.08] text-amber-400'
                                                    }`}
                                                    title={issue.description}
                                                >
                                                    {isError ? <XCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                                    {issue.issue_type}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <span className={`text-xs font-mono ${track.bitrate < 320 && track.bitrate > 0 ? "text-amber-400" : "text-zinc-500"}`}>
                                        {track.bitrate > 0 ? track.bitrate : '-'}
                                    </span>
                                    {track.bitrate > 0 && <span className="text-zinc-700 text-[10px] ml-0.5">kbps</span>}
                                </td>
                            </tr>
                        ))}

                        {filteredTracks.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-zinc-600 text-sm">
                                    No tracks match your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}