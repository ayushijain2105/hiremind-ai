from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes.health import router as health_router
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

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.app_name}"}