from fastapi import APIRouter, HTTPException, Depends
from app.models.user import UserRegister, UserLogin, TokenResponse, UserResponse
from app.utils.auth import hash_password, verify_password, create_access_token
from app.database import get_db
from bson import ObjectId
from pydantic import BaseModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.auth import decode_token


router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]

@router.post("/register", response_model=TokenResponse)
async def register(user: UserRegister):
    db = get_db()

    # Check if email already exists
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password and save user
    hashed = hash_password(user.password)
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed,
    }
    result = await db.users.insert_one(new_user)

    # Create JWT token
    token = create_access_token({"sub": str(result.inserted_id)})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=str(result.inserted_id),
            name=user.name,
            email=user.email
        )
    )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    db = get_db()

    # Find user by email
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Create JWT token
    token = create_access_token({"sub": str(user["_id"])})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"]
        )
    )
class UpdateProfileRequest(BaseModel):
    name: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.put("/profile")
async def update_profile(
    payload: UpdateProfileRequest,
    user_id: str = Depends(get_current_user)
):
    db = get_db()
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"name": payload.name}}
    )
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    return {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}

@router.put("/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    user_id: str = Depends(get_current_user)
):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user or not verify_password(payload.current_password, user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")

    hashed = hash_password(payload.new_password)
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": hashed}}
    )
    return {"message": "Password changed successfully"}