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

def _obj_id_timestamp(obj_id_str: str) -> int:
    return int(obj_id_str[:8], 16) * 1000

@router.get("/summary")
async def get_analytics_summary(user_id: str = Depends(get_current_user)):
    db = get_db()

    resumes_cursor = db.resumes.find(
        {"user_id": user_id, "analysis": {"$exists": True}},
        {"extracted_text": 0}
    ).sort("_id", 1)
    resumes = await resumes_cursor.to_list(200)

    sessions_cursor = db.interview_sessions.find(
        {"user_id": user_id, "status": "completed"}
    ).sort("_id", 1)
    sessions = await sessions_cursor.to_list(200)

    resumes_analyzed = len(resumes)
    interviews_done = len(sessions)

    ats_scores = [r["analysis"]["ats_score"] for r in resumes if "ats_score" in r.get("analysis", {})]
    latest_ats_score = ats_scores[-1] if ats_scores else None
    avg_ats_score = round(sum(ats_scores) / len(ats_scores), 1) if ats_scores else None

    interview_scores = [s["average_score"] for s in sessions if "average_score" in s]
    avg_interview_score = round(sum(interview_scores) / len(interview_scores), 1) if interview_scores else None

    unique_skills = set()
    for r in resumes:
        unique_skills.update(r.get("analysis", {}).get("top_skills", []))
    unique_missing_skills = set()
    for r in resumes:
        unique_missing_skills.update(r.get("analysis", {}).get("missing_skills", []))

    ats_trend = [
        {
            "id": str(r["_id"]),
            "date": _obj_id_timestamp(str(r["_id"])),
            "score": r["analysis"]["ats_score"],
            "filename": r.get("filename", "Resume"),
        }
        for r in resumes if "ats_score" in r.get("analysis", {})
    ]

    interview_trend = [
        {
            "id": str(s["_id"]),
            "date": _obj_id_timestamp(str(s["_id"])),
            "score": s["average_score"],
        }
        for s in sessions if "average_score" in s
    ]

    category_totals = {}
    for s in sessions:
        for ans in s.get("answers", []):
            q = next((qq for qq in s.get("questions", []) if qq["id"] == ans["question_id"]), None)
            category = q["category"] if q else "Other"
            category_totals.setdefault(category, []).append(ans["score"])
    category_breakdown = [
        {"category": cat, "average_score": round(sum(scores) / len(scores), 1), "count": len(scores)}
        for cat, scores in category_totals.items()
    ]

    return {
        "resumes_analyzed": resumes_analyzed,
        "interviews_done": interviews_done,
        "latest_ats_score": latest_ats_score,
        "avg_ats_score": avg_ats_score,
        "avg_interview_score": avg_interview_score,
        "skills_found_count": len(unique_skills),
        "missing_skills_count": len(unique_missing_skills),
        "ats_trend": ats_trend,
        "interview_trend": interview_trend,
        "category_breakdown": category_breakdown,
    }