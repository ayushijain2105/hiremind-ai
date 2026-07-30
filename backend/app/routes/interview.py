from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.auth import decode_token
from app.database import get_db
from app.services.gemini import generate_questions, evaluate_answer
from bson import ObjectId
from pydantic import BaseModel

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]

class AnswerInput(BaseModel):
    answer: str

@router.post("/start")
async def start_interview(user_id: str = Depends(get_current_user)):
    db = get_db()
    resume = await db.resumes.find_one(
        {"user_id": user_id, "analysis": {"$exists": True}},
        sort=[("_id", -1)]
    )
    if not resume:
        raise HTTPException(status_code=404, detail="No analyzed resume found")

    questions = await generate_questions(resume["extracted_text"])

    session = {
        "user_id": user_id,
        "resume_id": str(resume["_id"]),
        "questions": questions,
        "answers": [],
        "current_index": 0,
        "status": "in_progress",
    }
    result = await db.interview_sessions.insert_one(session)

    return {
        "session_id": str(result.inserted_id),
        "total_questions": len(questions),
        "current_question": questions[0],
    }

@router.post("/{session_id}/answer")
async def submit_answer(
    session_id: str,
    payload: AnswerInput,
    user_id: str = Depends(get_current_user)
):
    db = get_db()
    session = await db.interview_sessions.find_one({
        "_id": ObjectId(session_id),
        "user_id": user_id
    })
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["status"] == "completed":
        raise HTTPException(status_code=400, detail="Interview already completed")

    idx = session["current_index"]
    questions = session["questions"]
    current_q = questions[idx]

    evaluation = await evaluate_answer(current_q["question"], payload.answer, current_q["category"])

    answer_record = {
        "question_id": current_q["id"],
        "question": current_q["question"],
        "answer": payload.answer,
        "score": evaluation["score"],
        "feedback": evaluation["feedback"],
        "tip": evaluation["tip"],
    }

    next_index = idx + 1
    is_complete = next_index >= len(questions)

    update_data = {
        "$push": {"answers": answer_record},
        "$set": {"current_index": next_index}
    }
    if is_complete:
        update_data["$set"]["status"] = "completed"

    await db.interview_sessions.update_one({"_id": ObjectId(session_id)}, update_data)

    response = {
        "evaluation": evaluation,
        "is_complete": is_complete,
    }
    if not is_complete:
        response["next_question"] = questions[next_index]
        response["progress"] = {"current": next_index + 1, "total": len(questions)}
    else:
        updated = await db.interview_sessions.find_one({"_id": ObjectId(session_id)})
        scores = [a["score"] for a in updated["answers"]]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0
        await db.interview_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {"average_score": avg_score}}
        )
        response["average_score"] = avg_score

    return response

@router.get("/sessions")
async def get_sessions(user_id: str = Depends(get_current_user)):
    db = get_db()
    cursor = db.interview_sessions.find({"user_id": user_id}).sort("_id", -1)
    sessions = await cursor.to_list(50)
    for s in sessions:
        s["_id"] = str(s["_id"])
    return {"sessions": sessions}

@router.get("/{session_id}")
async def get_session(session_id: str, user_id: str = Depends(get_current_user)):
    db = get_db()
    session = await db.interview_sessions.find_one({
        "_id": ObjectId(session_id),
        "user_id": user_id
    })
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session["_id"] = str(session["_id"])
    return session