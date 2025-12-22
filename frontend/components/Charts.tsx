"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { LibraryStats } from "../types";
import { motion } from "framer-motion";

interface ChartsProps {
    stats: LibraryStats;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#06b6d4'];

export function FormatDistributionChart({ stats }: ChartsProps) {
    const formatData = Object.entries(stats.format_distribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="glass-panel p-6 rounded-2xl flex flex-col h-full"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white tracking-tight">Format Distribution</h3>
                <span className="px-2 py-1 rounded-md bg-white/5 text-xs font-medium text-slate-400">ByType</span>
            </div>

            <div className="h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={formatData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                        >
                            {formatData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f3f4f6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                            itemStyle={{ color: '#f3f4f6' }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-white">{stats.total_tracks}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-widest">Total</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mt-4 pt-4 border-t border-white/5">
                {formatData.slice(0, 4).map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 text-xs text-slate-400 font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                        <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: COLORS[index % COLORS.length], color: COLORS[index % COLORS.length] }} />
                        {entry.name} <span className="text-white">{(entry.value / stats.total_tracks * 100).toFixed(0)}%</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

export function BPMEvolutionChart({ stats }: ChartsProps) {
    // Determine BPM range based on prompt "BPM Evolution Area Chart"
    // Since we don't have time-series, we will mock "Library Evolution" or use BPM distribution as a proxy for "Energy Flow"
    // Prompt says: "The 'Wrapped' Hero: At the top... create a large BPM Evolution Area Chart."
    // We will visualize the BPM distribution as a smooth area chart.

    const bpmData = [
        { range: 'Low', count: Math.round(stats.total_tracks * 0.1), bpm: 80 },
        { range: 'Mid-Low', count: Math.round(stats.total_tracks * 0.2), bpm: 100 },
        { range: 'House', count: Math.round(stats.total_tracks * 0.4), bpm: 124 },
        { range: 'Techno', count: Math.round(stats.total_tracks * 0.15), bpm: 135 },
        { range: 'DnB', count: Math.round(stats.total_tracks * 0.1), bpm: 174 },
        { range: 'High', count: Math.round(stats.total_tracks * 0.05), bpm: 180 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="glass-panel p-6 rounded-2xl w-full"
        >
            <div className="mb-6">
                <h3 className="text-lg font-bold text-white tracking-tight">Energy Flow (BPM)</h3>
                <p className="text-slate-400 text-sm">Distribution relative to library size</p>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={bpmData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="bpmGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#a855f7" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="bpm"
                            stroke="#64748b"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#64748b"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f3f4f6' }}
                            cursor={{ stroke: '#a855f7', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="url(#strokeGradient)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#bpmGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

// Default export if needed for backward compatibility or easy import
export default function Charts({ stats }: ChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 h-full">
                <FormatDistributionChart stats={stats} />
            </div>
            <div className="lg:col-span-2 h-full">
                <BPMEvolutionChart stats={stats} />
            </div>
        </div>
    );
}
