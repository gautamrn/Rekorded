"""
Database Migration Script - Add filename column to libraries table

Run this script to update your database schema without losing data.
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/rekorded")

def migrate():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Add filename column to libraries table
        try:
            conn.execute(text("""
                ALTER TABLE libraries 
                ADD COLUMN IF NOT EXISTS filename VARCHAR DEFAULT 'collection.xml';
            """))
            conn.commit()
            print("✅ Successfully added 'filename' column to libraries table")
        except Exception as e:
            print(f"❌ Error: {e}")
            print("\nIf you want to start fresh, you can drop all tables and restart the backend:")
            print("  DROP TABLE IF EXISTS tracks CASCADE;")
            print("  DROP TABLE IF EXISTS libraries CASCADE;")
            print("  DROP TABLE IF EXISTS users CASCADE;")

if __name__ == "__main__":
    migrate()
