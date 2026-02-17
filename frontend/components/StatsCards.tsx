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
            accent: "text-blue-400",
            delay: 0
        },
        {
            title: "Gig Ready",
            value: `${percentageReady}%`,
            subtext: `${stats.total_gig_ready} tracks`,
            icon: CheckCircle2,
            accent: "text-emerald-400",
            delay: 0.05
        },
        {
            title: "Issues Found",
            value: Object.values(stats.issue_distribution).reduce((a, b) => a + b, 0).toLocaleString(),
            icon: AlertTriangle,
            accent: "text-amber-400",
            delay: 0.1
        },
        {
            title: "Duplicates",
            value: stats.issue_distribution["Duplicate"] || 0,
            icon: Layers,
            accent: "text-purple-400",
            delay: 0.15
        }
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {cards.map((card, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: card.delay, duration: 0.3 }}
                    className="card card-hover p-5"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-zinc-500 text-xs font-medium mb-1.5">{card.title}</p>
                            <h3 className="text-2xl font-semibold text-white tracking-tight">{card.value}</h3>
                            {card.subtext && <p className="text-xs text-zinc-600 mt-0.5">{card.subtext}</p>}
                        </div>
                        <div className={`${card.accent}`}>
                            <card.icon className="w-4 h-4" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}