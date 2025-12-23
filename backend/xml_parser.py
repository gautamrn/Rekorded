import xml.etree.ElementTree as ET
from typing import List, Dict, Tuple
from models import Track, TrackIssue, LibraryStats, AnalysisResult
import urllib.parse

def parse_rekordbox_xml(xml_content: bytes) -> AnalysisResult:
    root = ET.fromstring(xml_content)
    collection = root.find("COLLECTION")
    playlists_node = root.find("PLAYLISTS")
    
    if collection is None:
        return AnalysisResult(
            stats=LibraryStats(
                total_tracks=0, 
                total_gig_ready=0, 
                format_distribution={}, 
                issue_distribution={}
            ),
            tracks=[],
            flagged_tracks=[]
        )

    # 1. Parse Playlists Map: TrackID -> [Playlist Names]
    track_playlists: Dict[str, List[str]] = {}
    
    def parse_node(node, path=""):
        node_name = node.get("Name")
        node_type = node.get("Type") # 0=Folder, 1=Playlist
        
        current_path = f"{path} / {node_name}" if path else node_name
        
        if node_type == "1": # Playlist
            for track_ref in node.findall("TRACK"):
                key = track_ref.get("Key")
                if key:
                    if key not in track_playlists:
                        track_playlists[key] = []
                    track_playlists[key].append(current_path)
        
        # Recurse children
        for child in node.findall("NODE"):
            parse_node(child, current_path)

    if playlists_node:
        root_node = playlists_node.find("NODE") # Usually ROOT
        if root_node:
             parse_node(root_node, "") # Start parsing

    # 2. Parse Tracks
    tracks: List[Track] = []
    format_counts: Dict[str, int] = {}
    issue_counts: Dict[str, int] = {
        "Low Bitrate": 0,
        "Missing Cues": 0,
        "Broken Link": 0,
        "Duplicate": 0,
        "Dynamic Tempo": 0
    }
    
    bpm_dist: Dict[str, int] = {}
    key_dist: Dict[str, int] = {}
    genre_dist: Dict[str, int] = {}
    
    seen_tracks: Dict[Tuple[str, str], List[str]] = {} 

    total_ready = 0
    
    for entry in collection.findall("TRACK"):
        attr = entry.attrib
        
        name = attr.get("Name", "").strip()
        location = attr.get("Location", "")

        # 1. Ignore if no name
        if not name:
            continue
            
        # 2. Skip streamed tracks (updated check for file://localhost format)
        # SoundCloud, Spotify, Tidal, Beatport, etc.
        streaming_keywords = ["soundcloud", "spotify", "tidal", "beatport"]
        if any(kw in location.lower() for kw in streaming_keywords):
            continue
            
        tid = attr.get("TrackID", "")
        artist = attr.get("Artist", "Unknown")
        genre = attr.get("Genre", "Unknown")
        kind = attr.get("Kind", "Unknown File")
        
        bitrate_str = attr.get("BitRate", "0")
        bitrate = int(bitrate_str) if bitrate_str.isdigit() else 0
        
        bpm_str = attr.get("AverageBpm", "0")
        bpm = float(bpm_str) if bpm_str.replace('.', '', 1).isdigit() else 0.0
        
        tonality = attr.get("Tonality", "-")
        
        play_count_str = attr.get("PlayCount", "0")
        play_count = int(play_count_str) if play_count_str.isdigit() else 0
        
        cues = entry.findall("POSITION_MARK")
        has_cues = len(cues) > 0
        
        # Check excessive tempo tags
        tempos = entry.findall("TEMPO")
        has_dynamic_tempo = len(tempos) > 10
        
        current_issues = []
        
        is_compressed = "MP3" in kind.upper() or "AAC" in kind.upper()
        if is_compressed and 0 < bitrate < 256:
             current_issues.append(TrackIssue(issue_type="Low Bitrate", description=f"Bitrate is {bitrate}kbps", severity="warning"))
             issue_counts["Low Bitrate"] += 1

        if not has_cues:
            current_issues.append(TrackIssue(issue_type="Missing Cues", description="No Hot Cues or Memory Cues found", severity="warning"))
            issue_counts["Missing Cues"] += 1
            
        if not location:
            current_issues.append(TrackIssue(issue_type="Broken Link", description="No file location specified", severity="error"))
            issue_counts["Broken Link"] += 1
        
        if has_dynamic_tempo:
             current_issues.append(TrackIssue(issue_type="Dynamic Tempo", description=f"Track has {len(tempos)} tempo changes.", severity="warning"))
             issue_counts["Dynamic Tempo"] += 1

        norm_key = (artist.strip().lower(), name.strip().lower())
        if norm_key not in seen_tracks:
            seen_tracks[norm_key] = []
        seen_tracks[norm_key].append(tid)

        fmt = kind.split(" ")[0]
        format_counts[fmt] = format_counts.get(fmt, 0) + 1
        
        # Aggregates for Stats
        genre_dist[genre] = genre_dist.get(genre, 0) + 1
        key_dist[tonality] = key_dist.get(tonality, 0) + 1
        
        # Simple BPM distribution buckets
        if bpm > 0:
            bpm_bucket = f"{int(bpm // 10 * 10)}s"
            bpm_dist[bpm_bucket] = bpm_dist.get(bpm_bucket, 0) + 1

        is_gig_ready = has_cues and (not is_compressed or bitrate >= 256)
        if is_gig_ready:
            total_ready += 1
            
        t = Track(
            track_id=tid,
            name=name,
            artist=artist,
            genre=genre,
            kind=kind,
            bitrate=bitrate,
            sample_rate=int(attr.get("SampleRate", "0")),
            bpm=bpm,
            tonality=tonality,
            play_count=play_count,
            year=attr.get("Year", ""),
            location=location,
            issues=current_issues,
            has_cues=has_cues,
            playlists=track_playlists.get(tid, [])
        )
        tracks.append(t)

    duplicates_found = 0
    track_map = {t.track_id: t for t in tracks}
    
    for key, ids in seen_tracks.items():
        if len(ids) > 1:
            duplicates_found += len(ids)
            for tid in ids:
                t = track_map[tid]
                t.issues.append(TrackIssue(issue_type="Duplicate", description=f"Duplicate track found ({len(ids)} copies)", severity="warning"))
    
    issue_counts["Duplicate"] = duplicates_found
    flagged = [t for t in tracks if len(t.issues) > 0]
    
    return AnalysisResult(
        stats=LibraryStats(
            total_tracks=len(tracks),
            total_gig_ready=total_ready,
            format_distribution=format_counts,
            issue_distribution=issue_counts,
            bpm_distribution=bpm_dist,
            key_distribution=key_dist,
            genre_distribution=genre_dist
        ),
        tracks=tracks,
        flagged_tracks=flagged
    )
