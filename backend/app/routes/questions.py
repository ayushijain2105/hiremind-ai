from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.auth import decode_token
from app.database import get_db
from app.services.gemini import generate_questions

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]

@router.get("/generate")
async def get_questions(user_id: str = Depends(get_current_user)):
    db = get_db()
    resume = await db.resumes.find_one(
        {"user_id": user_id, "analysis": {"$exists": True}},
        sort=[("_id", -1)]
    )
    if not resume:
        raise HTTPException(status_code=404, detail="No analyzed resume found")
    questions = await generate_questions(resume["extracted_text"])
    return {"questions": questions}