"use client";

import { useState, useMemo, useEffect } from "react";
import UploadZone from "@/components/UploadZone";
import { FormatDistributionChart } from "@/components/Charts";
import TrackTable from "@/components/TrackTable";
import StatsCards from "@/components/StatsCards";
import StatsView from "@/components/StatsView";
import DashboardShell from "@/components/DashboardShell";
import { AnalysisResult, LibraryStats } from "@/types";
import { Disc3, Layers } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/nextjs";

export default function Home() {
  const { getToken } = useAuth();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"health" | "stats">("health");
  const [playlistFilter, setPlaylistFilter] = useState("all");

  // Get all unique playlists across all tracks
  const allPlaylists = useMemo(() => {
    if (!data || !data.tracks) return [];
    const s = new Set<string>();
    data.tracks.forEach(t => t.playlists.forEach(p => s.add(p)));
    return Array.from(s).sort();
  }, [data]);

  // Derive filtered data based on playlist selection
  const filteredData = useMemo(() => {
    if (!data || !data.tracks) return null;
    if (playlistFilter === "all") return data;

    const filteredTracks = data.tracks.filter(t => t.playlists.includes(playlistFilter));

    // Recalculate stats for the filtered set
    const formatCounts: Record<string, number> = {};
    const issueCounts: Record<string, number> = {
      "Low Bitrate": 0, "Missing Cues": 0, "Broken Link": 0, "Duplicate": 0, "Dynamic Tempo": 0
    };
    const genreDist: Record<string, number> = {};
    const keyDist: Record<string, number> = {};
    const bpmDist: Record<string, number> = {};
    let totalReady = 0;

    filteredTracks.forEach(t => {
      // Formats
      const fmt = t.kind.split(" ")[0];
      formatCounts[fmt] = (formatCounts[fmt] || 0) + 1;

      // Issues
      t.issues.forEach(issue => {
        if (issueCounts.hasOwnProperty(issue.issue_type)) {
          issueCounts[issue.issue_type]++;
        }
      });

      // Readiness
      const isCompressed = t.kind.toUpperCase().includes("MP3") || t.kind.toUpperCase().includes("AAC");
      const isReady = t.has_cues && (!isCompressed || t.bitrate >= 256);
      if (isReady) totalReady++;

      // Stats
      genreDist[t.genre] = (genreDist[t.genre] || 0) + 1;
      keyDist[t.tonality] = (keyDist[t.tonality] || 0) + 1;
      if (t.bpm > 0) {
        const bucket = `${Math.floor(t.bpm / 10) * 10}s`;
        bpmDist[bucket] = (bpmDist[bucket] || 0) + 1;
      }
    });

    const newStats: LibraryStats = {
      total_tracks: filteredTracks.length,
      total_gig_ready: totalReady,
      format_distribution: formatCounts,
      issue_distribution: issueCounts,
      bpm_distribution: bpmDist,
      key_distribution: keyDist,
      genre_distribution: genreDist
    };

    return {
      ...data,
      stats: newStats,
      tracks: filteredTracks,
      flagged_tracks: filteredTracks.filter(t => t.issues.length > 0)
    };
  }, [data, playlistFilter]);

  const loadLibrary = async (libraryId: number) => {
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:8000/libraries/${libraryId}`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const libraryData: AnalysisResult = await res.json();
        setData(libraryData);
        setPlaylistFilter("all");
      }
    } catch (error) {
      console.error("Failed to load library:", error);
    }
  };

  const loadMostRecentLibrary = async () => {
    try {
      const token = await getToken();
      if (!token) return; // Not logged in

      const res = await fetch("http://localhost:8000/libraries", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const libraries = await res.json();
        if (libraries.length > 0) {
          // Load the most recent (first in the list)
          await loadLibrary(libraries[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load recent library:", error);
    }
  };

  // Auto-load most recent library on mount
  useEffect(() => {
    loadMostRecentLibrary();
  }, []);

  // If no data, show Landing / Upload view
  if (!data || !filteredData) {
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
          <div className="flex items-center gap-4">
            <SignedIn>
              <button
                onClick={loadMostRecentLibrary}
                className="px-5 py-2 rounded-full border border-white/10 text-sm font-medium text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all bg-white/5 backdrop-blur-md"
              >
                Home
              </button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-5 py-2 rounded-full border border-white/10 text-sm font-medium text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all bg-white/5 backdrop-blur-md">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center space-y-6 max-w-4xl mb-16 relative">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-full pointer-events-none -z-10" />

            <h2 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white leading-tight">
              Export with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">
                Confidence.
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-light">
              The ultimate USB health check for your Rekordbox collection. Instantly detect low-bitrate, missing cues, and broken links.
            </p>
          </div>

          <UploadZone onAnalysisComplete={setData} />
        </div>
      </main>
    );
  }

  // Dashboard View: Wrapped in DashboardShell
  return (
    <DashboardShell
      onUploadNew={() => { setData(null); setPlaylistFilter("all"); }}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLibrarySelect={loadLibrary}
    >
      {/* Global Playlist Selector */}
      <div className="flex justify-end mb-4">
        <div className="relative">
          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select
            className="bg-[#0f172a]/50 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer hover:bg-white/5 transition-colors"
            value={playlistFilter}
            onChange={(e) => setPlaylistFilter(e.target.value)}
          >
            <option value="all">All Playlists</option>
            {allPlaylists.map(p => (
              <option key={p} value={p}>{p.split('/').pop()}</option>
            ))}
          </select>
        </div>
      </div>

      {activeTab === "health" ? (
        <>
          {/* Hero Section Reorganized: Stats left, Chart right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <StatsCards stats={filteredData.stats} />
            </div>
            <div className="lg:col-span-1">
              <FormatDistributionChart stats={filteredData.stats} />
            </div>
          </div>

          {/* Table synced with global selection */}
          <TrackTable tracks={filteredData.tracks || []} playlistFilter={playlistFilter} />
        </>
      ) : (
        <StatsView stats={filteredData.stats} tracks={filteredData.tracks || []} />
      )}
    </DashboardShell>
  );
}

