from pydantic import BaseModel
from typing import List, Dict, Optional

class TrackIssue(BaseModel):
    issue_type: str
    description: str
    severity: str = "warning"

class Track(BaseModel):
    track_id: str
    name: str = "Unknown"
    artist: str = "Unknown"
    album: str = "-"
    genre: str = "-"
    kind: str = "Unknown"
    bitrate: int = 0
    sample_rate: int = 0
    year: str = "-"
    location: str
    issues: List[TrackIssue] = []
    
    playlists: List[str] = []
    has_cues: bool = False

class LibraryStats(BaseModel):
    total_tracks: int
    total_gig_ready: int
    format_distribution: Dict[str, int]
    issue_distribution: Dict[str, int]

class AnalysisResult(BaseModel):
    stats: LibraryStats
    tracks: List[Track]
    flagged_tracks: List[Track] 
