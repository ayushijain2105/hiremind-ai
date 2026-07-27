from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.auth import decode_token
from app.database import get_db
import fitz
import os
import uuid

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    file_id = str(uuid.uuid4())
    file_path = f"uploads/{file_id}.pdf"

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    db = get_db()
    resume_data = {
        "user_id": user_id,
        "filename": file.filename,
        "file_id": file_id,
        "extracted_text": text,
    }
    result = await db.resumes.insert_one(resume_data)

    return {
        "message": "Resume uploaded successfully",
        "resume_id": str(result.inserted_id),
        "filename": file.filename,
        "text_length": len(text),
        "preview": text[:300]
    }

@router.get("/my-resumes")
async def get_my_resumes(user_id: str = Depends(get_current_user)):
    db = get_db()
    resumes = await db.resumes.find(
        {"user_id": user_id},
        {"extracted_text": 0}
    ).to_list(10)

    for resume in resumes:
        resume["_id"] = str(resume["_id"])

    return {"resumes": resumes}