from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from xml_parser import parse_rekordbox_xml
from models import AnalysisResult
from database import engine, get_db
import models_db
from auth import get_optional_current_user

# Create Database Tables
models_db.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Rekorded API", version="1.0")

import os

# Security: CORS and Allowed Hosts
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Rekorded API is running"}

@app.get("/libraries")
async def get_user_libraries(
    current_user: dict = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    user_id = current_user.get("sub")
    libraries = db.query(models_db.Library).filter(
        models_db.Library.user_id == user_id
    ).order_by(models_db.Library.upload_date.desc()).all()
    
    return [{
        "id": lib.id,
        "upload_date": lib.upload_date.isoformat(),
        "total_tracks": lib.total_tracks,
        "filename": lib.filename or "collection.xml"
    } for lib in libraries]

@app.get("/libraries/{library_id}")
async def get_library(
    library_id: int,
    current_user: dict = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    user_id = current_user.get("sub")
    library = db.query(models_db.Library).filter(
        models_db.Library.id == library_id,
        models_db.Library.user_id == user_id
    ).first()
    
    if not library:
        raise HTTPException(status_code=404, detail="Library not found")
    
    # Re-parse the XML to get fresh stats
    result = parse_rekordbox_xml(library.xml_content.encode())
    return result

@app.delete("/libraries/{library_id}")
async def delete_library(
    library_id: int,
    current_user: dict = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    user_id = current_user.get("sub")
    library = db.query(models_db.Library).filter(
        models_db.Library.id == library_id,
        models_db.Library.user_id == user_id
    ).first()
    
    if not library:
        raise HTTPException(status_code=404, detail="Library not found")
    
    db.delete(library)
    db.commit()
    return {"message": "Library deleted successfully"}


@app.post("/upload", response_model=AnalysisResult)
async def upload_collection(
    file: UploadFile = File(...), 
    current_user: dict = Depends(get_optional_current_user), # Modified dependency
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".xml"):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload collection.xml")
    
    try:
        content = await file.read()
        result = parse_rekordbox_xml(content)
        
        # Save to DB ONLY if user is logged in
        if current_user:
            user_id = current_user.get("sub")
            
            # Check if user exists, if not create
            db_user = db.query(models_db.User).filter(models_db.User.id == user_id).first()
            if not db_user:
                db_user = models_db.User(id=user_id, email=current_user.get("email", "")) # Email might be in array
                db.add(db_user)
                db.commit()
                db.refresh(db_user)
                
            # Create Library Entry
            db_library = models_db.Library(
                user_id=user_id,
                total_tracks=result.stats.total_tracks,
                filename=file.filename,
                xml_content=content.decode('utf-8')  # Store XML for later
            )
            db.add(db_library)
            db.commit()
            db.refresh(db_library)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse XML: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

