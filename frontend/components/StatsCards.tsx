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
            gradient: "from-blue-500/20 to-blue-600/5",
            delay: 0
        },
        {
            title: "Gig Ready",
            value: `${percentageReady}%`,
            subtext: `${stats.total_gig_ready} tracks`,
            icon: CheckCircle2,
            color: "emerald",
            gradient: "from-emerald-500/20 to-emerald-600/5",
            delay: 0.1
        },
        {
            title: "Issues Found",
            value: Object.values(stats.issue_distribution).reduce((a, b) => a + b, 0).toLocaleString(),
            icon: AlertTriangle,
            color: "amber",
            gradient: "from-amber-500/20 to-amber-600/5",
            delay: 0.2
        },
        {
            title: "Duplicates",
            value: stats.issue_distribution["Duplicate"] || 0,
            icon: Layers,
            color: "purple",
            gradient: "from-purple-500/20 to-purple-600/5",
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
                    className="glass-card rounded-2xl p-6 relative overflow-hidden group"
                >
                    <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${card.gradient} blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">{card.title}</p>
                            <h3 className="text-3xl font-bold text-white tracking-tight mb-1">{card.value}</h3>
                            {card.subtext && <p className="text-xs text-slate-500 font-medium">{card.subtext}</p>}
                        </div>
                        <div className={`p-3 rounded-xl bg-white/5 text-${card.color}-400 ring-1 ring-white/10 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <card.icon className="w-5 h-5" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
