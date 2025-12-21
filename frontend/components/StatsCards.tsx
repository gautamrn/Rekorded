"use client";

import { LibraryStats } from "../types";
import { Music, CheckCircle2, AlertTriangle, Layers } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardsProps {
    stats: LibraryStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
    const percentageReady = stats.total_tracks > 0
        ? Math.round((stats.total_gig_ready / stats.total_tracks) * 100)
        : 0;

    const cards = [
        {
            title: "Total Tracks",
            value: stats.total_tracks.toLocaleString(),
            icon: Music,
            color: "blue",
            delay: 0
        },
        {
            title: "Gig Ready",
            value: `${percentageReady}%`,
            subtext: `${stats.total_gig_ready} tracks`,
            icon: CheckCircle2,
            color: "emerald",
            delay: 0.1
        },
        {
            title: "Issues Found",
            value: Object.values(stats.issue_distribution).reduce((a, b) => a + b, 0).toLocaleString(),
            icon: AlertTriangle,
            color: "amber",
            delay: 0.2
        },
        {
            title: "Duplicates",
            value: stats.issue_distribution["Duplicate"] || 0,
            icon: Layers,
            color: "purple",
            delay: 0.3
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: card.delay, duration: 0.4 }}
                    className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 backdrop-blur-md shadow-xl"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">{card.title}</p>
                            <h3 className="text-3xl font-bold text-white tracking-tight">{card.value}</h3>
                            {card.subtext && <p className="text-xs text-slate-500 mt-1">{card.subtext}</p>}
                        </div>
                        <div className={`p-3 rounded-xl bg-${card.color}-500/10 text-${card.color}-500 shadow-inner ring-1 ring-${card.color}-500/20`}>
                            <card.icon className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
