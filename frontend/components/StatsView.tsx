"use client";

import { LibraryStats, Track } from "../types";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, Legend
} from "recharts";
import { motion } from "framer-motion";

interface StatsViewProps {
    stats: LibraryStats;
    tracks: Track[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const tooltipStyle = {
    contentStyle: {
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        fontSize: '12px',
    },
    itemStyle: { color: '#e4e4e7' },
    cursor: { fill: 'rgba(255,255,255,0.02)' }
};

export default function StatsView({ stats, tracks }: StatsViewProps) {
    const bpmData = Object.entries(stats.bpm_distribution || {})
        .map(([range, count]) => ({ range, count, bpm: parseInt(range) }))
        .sort((a, b) => a.bpm - b.bpm);

    const keyData = Object.entries(stats.key_distribution || {})
        .filter(([key]) => key !== "-")
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const genreData = Object.entries(stats.genre_distribution || {})
        .filter(([name]) => name && name !== "Unknown" && name !== "-")
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    const noGenreCount = tracks.filter(t => !t.genre || t.genre === "Unknown" || t.genre === "-").length;

    const topTracks = [...tracks]
        .sort((a, b) => b.play_count - a.play_count)
        .slice(0, 5);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* BPM & Key */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-5">
                    <h3 className="text-sm font-medium text-zinc-300 mb-4">BPM Profile</h3>
                    <div className="h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bpmData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="range" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip {...tooltipStyle} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card p-5">
                    <h3 className="text-sm font-medium text-zinc-300 mb-4">Top Keys</h3>
                    <div className="h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={keyData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="key" type="category" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} width={50} />
                                <Tooltip {...tooltipStyle} />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 3, 3, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Genre & Heavy Rotation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-zinc-300">Genre Breakdown</h3>
                        {noGenreCount > 0 && (
                            <span className="text-[11px] text-zinc-600">{noGenreCount} untagged</span>
                        )}
                    </div>
                    <div className="h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genreData}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {genreData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        color: '#e4e4e7',
                                        fontSize: '12px'
                                    }}
                                    itemStyle={{ color: '#e4e4e7' }}
                                />
                                <Legend
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    formatter={(value) => <span className="text-zinc-500 text-xs">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card p-5">
                    <h3 className="text-sm font-medium text-zinc-300 mb-4">Heavy Rotation</h3>
                    <div className="space-y-2">
                        {topTracks.map((track, i) => (
                            <div key={track.track_id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <span className="text-xs font-mono text-zinc-600 w-5 text-right shrink-0">{i + 1}</span>
                                    <div className="overflow-hidden">
                                        <div className="text-sm text-zinc-200 truncate">{track.name}</div>
                                        <div className="text-xs text-zinc-600 truncate">{track.artist}</div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                    <span className="text-sm font-medium text-zinc-400">{track.play_count}</span>
                                    <span className="text-[10px] text-zinc-700 ml-1">plays</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}