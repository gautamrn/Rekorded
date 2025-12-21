export interface TrackIssue {
    issue_type: string;
    description: string;
    severity: "warning" | "error";
}

export interface Track {
    track_id: string;
    name: string;
    artist: string;
    album: string;
    genre: string;
    kind: string;
    bitrate: number;
    sample_rate: number;
    year: string;
    location: string;
    issues: TrackIssue[];
    has_cues: boolean;
    playlists: string[];
}

export interface LibraryStats {
    total_tracks: number;
    total_gig_ready: number;
    format_distribution: Record<string, number>;
    issue_distribution: Record<string, number>;
}

export interface AnalysisResult {
    stats: LibraryStats;
    flagged_tracks: Track[];
    tracks?: Track[];
}
