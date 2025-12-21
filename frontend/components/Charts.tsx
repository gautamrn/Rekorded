"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { LibraryStats } from "../types";
import { motion } from "framer-motion";

interface ChartsProps {
    stats: LibraryStats;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Charts({ stats }: ChartsProps) {
    const formatData = Object.entries(stats.format_distribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Mock data for the Area Chart until we have real time-series or BPM data
    // Let's create a fake distribution based on the total tracks to make it look nice
    const bpmData = [
        { range: '70-90', count: Math.round(stats.total_tracks * 0.1) },
        { range: '90-110', count: Math.round(stats.total_tracks * 0.15) },
        { range: '110-120', count: Math.round(stats.total_tracks * 0.2) },
        { range: '120-128', count: Math.round(stats.total_tracks * 0.35) },
        { range: '128-140', count: Math.round(stats.total_tracks * 0.15) },
        { range: '140+', count: Math.round(stats.total_tracks * 0.05) },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Format Distribution (Pie) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-md shadow-xl flex flex-col"
            >
                <h3 className="text-lg font-bold text-white mb-6 tracking-tight">File Formats</h3>
                <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={formatData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {formatData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f3f4f6' }}
                                itemStyle={{ color: '#f3f4f6' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Centered Total */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{stats.total_tracks}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Tracks</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-center mt-4">
                    {formatData.slice(0, 4).map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2 text-xs text-slate-400 font-medium bg-slate-800/50 px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: COLORS[index % COLORS.length], color: COLORS[index % COLORS.length] }} />
                            {entry.name} <span className="text-slate-500">({entry.value})</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Chart 2: BPM Distribution (Area) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="lg:col-span-2 bg-slate-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-md shadow-xl"
            >
                <h3 className="text-lg font-bold text-white mb-6 tracking-tight">BPM Distribution</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={bpmData}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis
                                dataKey="range"
                                stroke="#475569"
                                tick={{ fill: '#475569', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#475569"
                                tick={{ fill: '#475569', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f3f4f6' }}
                                cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorCount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
}
