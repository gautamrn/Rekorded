"use client";

import { LibraryStats, Track } from "../types";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, Legend
} from "recharts";
import { motion } from "framer-motion";
import { Activity, Music, Key, Flame } from "lucide-react";

interface StatsViewProps {
    stats: LibraryStats;
    tracks: Track[];
}

const COLORS = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function StatsView({ stats, tracks }: StatsViewProps) {
    // Process BPM distribution for BarChart
    const bpmData = Object.entries(stats.bpm_distribution || {})
        .map(([range, count]) => ({
            range,
            count,
            bpm: parseInt(range)
        }))
        .sort((a, b) => a.bpm - b.bpm);

    // Process Key distribution for BarChart
    const keyData = Object.entries(stats.key_distribution || {})
        .filter(([key]) => key !== "-")
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Process Genre distribution for PieChart
    const genreDataRaw = Object.entries(stats.genre_distribution || {});
    const genreData = genreDataRaw
        .filter(([name]) => name && name !== "Unknown" && name !== "-")
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    const noGenreCount = tracks.filter(t => !t.genre || t.genre === "Unknown" || t.genre === "-").length;

    // Get Top Played Tracks
    const topTracks = [...tracks]
        .sort((a, b) => b.play_count - a.play_count)
        .slice(0, 5);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Row 1: BPM & Key */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* BPM Profile (Bar Chart Reverted) */}
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-6 text-blue-400">
                        <Activity className="w-5 h-5" />
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">BPM Profile</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bpmData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="range"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Key Distribution */}
                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-6 text-purple-400">
                        <Key className="w-5 h-5" />
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Top Harmonics</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={keyData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="key"
                                    type="category"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    width={60}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 2: Genre & Heavy Rotation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Genre Pie */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Music className="w-5 h-5" />
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Genre Breakdown</h3>
                        </div>
                        {noGenreCount > 0 && (
                            <span className="text-[10px] text-slate-500 font-medium">
                                {noGenreCount} tracks with no genre
                            </span>
                        )}
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genreData}
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {genreData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    formatter={(value) => <span className="text-slate-400 text-xs font-medium">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Played List */}
                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-6 text-orange-400">
                        <Flame className="w-5 h-5" />
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Heavy Rotation</h3>
                    </div>
                    <div className="space-y-4">
                        {topTracks.map((track, i) => (
                            <div key={track.track_id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-orange-500/30 transition-all">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 font-bold text-xs ring-1 ring-orange-500/20">
                                        #{i + 1}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-white font-semibold truncate">{track.name}</div>
                                        <div className="text-slate-500 text-xs truncate">{track.artist}</div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-orange-400 font-bold">{track.play_count}</div>
                                    <div className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Plays</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
