from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # Clerk ID
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    libraries = relationship("Library", back_populates="owner")

class Library(Base):
    __tablename__ = "libraries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    total_tracks = Column(Integer, default=0)
    filename = Column(String, default="collection.xml")
    xml_content = Column(String)  # Store the XML content for re-parsing
    
    owner = relationship("User", back_populates="libraries")
    tracks = relationship("DBTrack", back_populates="library", cascade="all, delete-orphan")

class DBTrack(Base):
    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True)
    library_id = Column(Integer, ForeignKey("libraries.id"))
    
    # Core Metadata
    rekordbox_id = Column(String, index=True)
    name = Column(String, index=True)
    artist = Column(String, index=True)
    album = Column(String)
    genre = Column(String)
    bpm = Column(Float)
    bitrate = Column(Integer)
    year = Column(String)
    
    # Analysis Data
    has_cues = Column(Boolean, default=False)
    issues = Column(JSON) # Storing list of issues as JSON
    
    library = relationship("Library", back_populates="tracks")
