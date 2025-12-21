from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .parser import parse_rekordbox_xml
from .models import AnalysisResult

app = FastAPI(title="Rekorded API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Rekorded API is running"}

@app.post("/upload", response_model=AnalysisResult)
async def upload_collection(file: UploadFile = File(...)):
    if not file.filename.endswith(".xml"):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload collection.xml")
    
    try:
        content = await file.read()
        result = parse_rekordbox_xml(content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse XML: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
