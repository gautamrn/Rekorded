"""
Database Migration Script - Add xml_content column to libraries table
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/rekorded")

def migrate():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        try:
            conn.execute(text("""
                ALTER TABLE libraries 
                ADD COLUMN IF NOT EXISTS xml_content TEXT;
            """))
            conn.commit()
            print("✅ Successfully added 'xml_content' column to libraries table")
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    migrate()
