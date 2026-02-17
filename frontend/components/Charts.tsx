"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { LibraryStats } from "../types";
import { motion } from "framer-motion";

interface ChartsProps {
    stats: LibraryStats;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981'];

export function FormatDistributionChart({ stats }: ChartsProps) {
    const formatData = Object.entries(stats.format_distribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="card p-5 flex flex-col h-full"
        >
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Format Distribution</h3>

            <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={formatData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                        >
                            {formatData.map((_, index) => (
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
                    </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-semibold text-white">{stats.total_tracks}</span>
                    <span className="text-[11px] text-zinc-600">total</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-[var(--border)]">
                {formatData.slice(0, 4).map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span>{entry.name}</span>
                        <span className="text-zinc-400">{(entry.value / stats.total_tracks * 100).toFixed(0)}%</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

export default function Charts({ stats }: ChartsProps) {
    return <FormatDistributionChart stats={stats} />;
}