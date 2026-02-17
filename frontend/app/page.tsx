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

  const allPlaylists = useMemo(() => {
    if (!data || !data.tracks) return [];
    const s = new Set<string>();
    data.tracks.forEach(t => t.playlists.forEach(p => s.add(p)));
    return Array.from(s).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data || !data.tracks) return null;
    if (playlistFilter === "all") return data;

    const filteredTracks = data.tracks.filter(t => t.playlists.includes(playlistFilter));

    const formatCounts: Record<string, number> = {};
    const issueCounts: Record<string, number> = {
      "Low Bitrate": 0, "Missing Cues": 0, "Broken Link": 0, "Duplicate": 0, "Dynamic Tempo": 0
    };
    const genreDist: Record<string, number> = {};
    const keyDist: Record<string, number> = {};
    const bpmDist: Record<string, number> = {};
    let totalReady = 0;

    filteredTracks.forEach(t => {
      const fmt = t.kind.split(" ")[0];
      formatCounts[fmt] = (formatCounts[fmt] || 0) + 1;

      t.issues.forEach(issue => {
        if (issueCounts.hasOwnProperty(issue.issue_type)) {
          issueCounts[issue.issue_type]++;
        }
      });

      const isCompressed = t.kind.toUpperCase().includes("MP3") || t.kind.toUpperCase().includes("AAC");
      const isReady = t.has_cues && (!isCompressed || t.bitrate >= 256);
      if (isReady) totalReady++;

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
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')}/libraries/${libraryId}`, {
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
      if (!token) return;

      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')}/libraries`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const libraries = await res.json();
        if (libraries.length > 0) {
          await loadLibrary(libraries[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load recent library:", error);
    }
  };

  useEffect(() => {
    loadMostRecentLibrary();
  }, []);

  if (!data || !filteredData) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-zinc-200 flex flex-col relative overflow-hidden font-sans">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/[0.04] blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <header className="w-full px-8 py-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <Disc3 className="text-blue-500 w-5 h-5 animate-spin-slow" />
            <span className="text-lg font-semibold text-white tracking-tight">Rekorded</span>
          </div>
          <div className="flex items-center gap-3">
            <SignedIn>
              <button
                onClick={loadMostRecentLibrary}
                className="px-4 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 z-10">
          <div className="text-center space-y-4 max-w-xl mb-12">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
              Audit your Rekordbox library
            </h2>
            <p className="text-base text-zinc-500 leading-relaxed max-w-md mx-auto">
              Drop your collection.xml to detect low-bitrate files, missing cues, broken links, and duplicates before your next gig.
            </p>
          </div>

          <UploadZone onAnalysisComplete={setData} />
        </div>
      </main>
    );
  }

  return (
    <DashboardShell
      onUploadNew={() => { setData(null); setPlaylistFilter("all"); }}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLibrarySelect={loadLibrary}
    >
      {/* Playlist Selector */}
      <div className="flex justify-end mb-6">
        <div className="relative">
          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <select
            className="bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-8 pr-8 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-500/40 appearance-none cursor-pointer hover:border-[var(--border-hover)] transition-colors"
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StatsCards stats={filteredData.stats} />
            </div>
            <div className="lg:col-span-1">
              <FormatDistributionChart stats={filteredData.stats} />
            </div>
          </div>

          <TrackTable tracks={filteredData.tracks || []} playlistFilter={playlistFilter} />
        </>
      ) : (
        <StatsView stats={filteredData.stats} tracks={filteredData.tracks || []} />
      )}
    </DashboardShell>
  );
}