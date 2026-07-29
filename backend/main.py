from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes.health import router as health_router
from app.routes.auth import router as auth_router
from app.routes.resume import router as resume_router
from app.routes.analysis import router as analysis_router
from app.routes.questions import router as questions_router
from app.database import connect_db, close_db


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(resume_router, prefix="/api/resume")
app.include_router(analysis_router, prefix="/api/analysis")
app.include_router(questions_router, prefix="/api/questions")

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.app_name}"}

    