from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.auth import decode_token
from app.database import get_db

router = APIRouter()
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    return payload["sub"]


@router.get("/latest")
async def get_latest_ats(user_id: str = Depends(get_current_user)):
    db = get_db()

    resume = await db.resumes.find_one(
        {
            "user_id": user_id,
            "analysis": {"$exists": True}
        },
        sort=[("_id", -1)]
    )

    if not resume:
        raise HTTPException(status_code=404, detail="No analyzed resume found")

    analysis = resume["analysis"]

    structure = analysis.get("structure", {})
    content = analysis.get("content", {})
    impact = analysis.get("impact", {})

    structure_score = structure.get("score", 80)
    content_score = content.get("score", 80)
    impact_score = impact.get("score", 80)

    ats_score = round(
        (structure_score * 0.30)
        + (content_score * 0.40)
        + (impact_score * 0.30)
    )

    return {
        "overall_score": ats_score,
        "breakdown": {
            "Structure": structure_score,
            "Content": content_score,
            "Impact": impact_score
        },
        "suggestions": analysis.get("suggestions", [])
    }