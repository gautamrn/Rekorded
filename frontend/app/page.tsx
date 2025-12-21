"use client";

import { useState } from "react";
import UploadZone from "@/components/UploadZone";
import Charts from "@/components/Charts";
import TrackTable from "@/components/TrackTable";
import StatsCards from "@/components/StatsCards";
import Sidebar from "@/components/Sidebar";
import { AnalysisResult } from "@/types";
import { Disc3 } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<AnalysisResult | null>(null);

  // If no data, show Landing / Upload view
  if (!data) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 flex flex-col relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <header className="w-full px-6 py-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Disc3 className="text-white w-6 h-6 animate-spin-slow" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Rekorded</h1>
          </div>
          <button className="px-5 py-2 rounded-full border border-slate-700 text-sm font-medium text-slate-300 hover:text-white hover:border-slate-500 transition-colors bg-slate-900/50 backdrop-blur-md">
            GitHub
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center space-y-6 max-w-3xl mb-12">
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Your Library, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 animate-gradient-x">
                Perfected.
              </span>
            </h2>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
              The ultimate health check for your Rekordbox collection. Detect low-bitrate files, missing cues, and dynamic tempos instantly.
            </p>
          </div>

          <UploadZone onAnalysisComplete={setData} />
        </div>
      </main>
    );
  }

  // Dashboard View
  return (
    <div className="bg-slate-950 min-h-screen flex text-slate-200 selection:bg-blue-500/30 font-sans">
      <Sidebar />

      <main className="flex-1 p-8 h-screen overflow-y-auto">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Overview</h1>
            <p className="text-slate-400">Welcome back, DJ.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setData(null)}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Upload New
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
              Export Report
            </button>
          </div>
        </header>

        <div className="space-y-8 max-w-7xl mx-auto pb-12">
          {/* Section 1: Hero Stats */}
          <StatsCards stats={data.stats} />

          {/* Section 2: Charts */}
          <Charts stats={data.stats} />

          {/* Section 3: Flagged Tracks Table */}
          <TrackTable tracks={data.tracks || []} />
        </div>
      </main>
    </div>
  );
}
