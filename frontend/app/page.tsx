"use client";

import { useState } from "react";
import UploadZone from "@/components/UploadZone";
import Charts from "@/components/Charts";
import TrackTable from "@/components/TrackTable";
import StatsCards from "@/components/StatsCards";
import DashboardShell from "@/components/DashboardShell";
import { AnalysisResult } from "@/types";
import { Disc3 } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<AnalysisResult | null>(null);

  // If no data, show Landing / Upload view
  if (!data) {
    return (
      <main className="min-h-screen bg-[#020617] text-slate-200 selection:bg-purple-500/30 flex flex-col relative overflow-hidden font-sans">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

        {/* Grid Background */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        {/* Header */}
        <header className="w-full px-8 py-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
              <Disc3 className="text-white w-6 h-6 animate-spin-slow" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Rekorded</h1>
          </div>
          <button className="px-5 py-2 rounded-full border border-white/10 text-sm font-medium text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all bg-white/5 backdrop-blur-md">
            GitHub
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center space-y-6 max-w-4xl mb-16 relative">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-full pointer-events-none -z-10" />

            <h2 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white leading-tight">
              Your Library, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">
                Perfected.
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-light">
              The ultimate health check for your Rekordbox collection. Detect low-bitrate files, missing cues, and dynamic tempos instantly.
            </p>
          </div>

          <UploadZone onAnalysisComplete={setData} />
        </div>
      </main>
    );
  }

  // Dashboard View: Wrapped in DashboardShell
  return (
    <DashboardShell onUploadNew={() => setData(null)}>
      {/* Section 1: Hero Stats */}
      <StatsCards stats={data.stats} />

      {/* Section 2: Charts */}
      <Charts stats={data.stats} />

      {/* Section 3: Flagged Tracks Table */}
      <TrackTable tracks={data.tracks || []} />
    </DashboardShell>
  );
}
