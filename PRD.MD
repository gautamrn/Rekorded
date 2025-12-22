# Product Requirements Document: BeatBound (Library Utility V1)

## 1. Project Overview
Rekorded is a web-based "Library Health Check" tool for DJs. It allows users to upload their Rekordbox `collection.xml` file to receive an immediate technical audit of their music collection, highlighting quality issues and metadata gaps.

---

## 2. Target Audience
- **Rekordbox DJs:** Who want a quick way to find low-quality files or "unprepped" tracks.
- **SWE Recruiters:** Looking for clean code, file parsing logic, and professional UI/UX.

---

## 3. Core Features (MVP)

### Feature 1: The XML Data Pipeline
- **File Upload:** A drag-and-drop interface for the Rekordbox `collection.xml`.
- **Fast Parser:** A Python-based backend that converts the XML tree into a structured Pandas DataFrame.
- **Track Classification:** Categorize tracks by file type (WAV, AIFF, MP3, etc.).

### Feature 2: The "Health Audit" (Utility Focus)
- **Low-Bitrate Warning:** Flag any MP3 tracks with a bitrate lower than 256kbps.
- **Prep-Level Metric:** Identify tracks missing "Hot Cues" or "Memory Cues."
- **Broken Link Finder:** Identify tracks with missing file paths or inconsistent naming.
- **Duplicate Detection:** Find tracks with identical Artist/Title names to save disk space.

### Feature 3: Visual Dashboard
- **Library Composition:** A pie chart showing the distribution of file formats.
- **Prep Progress Bar:** A visual percentage of how much of the library is "Gig Ready" (has cues and high bitrate).
- **Searchable Table:** A filterable list of all "Flagged" tracks for easy fixing in Rekordbox.

---

## 4. Technical Stack
| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | Next.js (React) | Modern, fast, and shows familiarity with industry-standard frameworks. |
| **Styling** | Tailwind CSS | Allows for rapid, beautiful UI development. |
| **Backend** | FastAPI (Python) | Lightweight and extremely fast at handling file uploads. |
| **Data Logic** | Python (ElementTree) | Built-in library to parse XML structures efficiently. |
| **Charts** | Recharts | Simple, declarative React charts that look professional. |

## 4. Extended Backend Requirements (Auth & DB)
- **User Management:** Secure sign-up/login via Google OAuth or Clerk.
- **Relational Schema:** Implementation of a PostgreSQL database to store long-term library trends.
- **Data Deduplication:** Logic to prevent duplicate track entries when a user uploads multiple XMLs over time.
- **API Caching:** Store Spotify "Energy" scores in the DB so you don't call the API for the same track twice (saving costs/limits).
---

## 5. Success Metrics for Resume
- **Data Integrity:** Accurately parse collections with 10,000+ tracks without crashing.
- **User Experience:** File upload to dashboard visualization in under 3 seconds.
- **Code Quality:** Clean separation of concerns between the Parsing Logic and the API Endpoints.

---

## 6. Future Expansion (V2)
- Direct SQLite database integration (removing the need for manual XML export).
- Spotify API enrichment for "Energy/Danceability" metrics.
- Exporting the "Fix List" as a CSV for shopping on Beatport/Bandcamp.