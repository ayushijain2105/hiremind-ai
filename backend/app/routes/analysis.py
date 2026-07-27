from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.auth import decode_token
from app.database import get_db
from app.services.gemini import analyze_resume
from bson import ObjectId

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]

@router.post("/analyze/{resume_id}")
async def analyze(
    resume_id: str,
    user_id: str = Depends(get_current_user)
):
    db = get_db()

    # Get resume from MongoDB
    resume = await db.resumes.find_one({
        "_id": ObjectId(resume_id),
        "user_id": user_id
    })

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Check if already analyzed
    if "analysis" in resume:
        return {
            "message": "Analysis retrieved from cache",
            "resume_id": resume_id,
            "analysis": resume["analysis"]
        }

    # Analyze with Gemini
    analysis = await analyze_resume(resume["extracted_text"])

    # Save analysis to MongoDB
    await db.resumes.update_one(
        {"_id": ObjectId(resume_id)},
        {"$set": {"analysis": analysis}}
    )

    return {
        "message": "Resume analyzed successfully",
        "resume_id": resume_id,
        "analysis": analysis
    }

@router.get("/latest")
async def get_latest_analysis(user_id: str = Depends(get_current_user)):
    db = get_db()

    resume = await db.resumes.find_one(
        {"user_id": user_id, "analysis": {"$exists": True}},
        sort=[("_id", -1)]
    )

    if not resume:
        raise HTTPException(status_code=404, detail="No analysis found")

    resume["_id"] = str(resume["_id"])
    resume.pop("extracted_text", None)

    return resume