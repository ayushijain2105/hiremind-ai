from fastapi import APIRouter, HTTPException
from app.models.user import UserRegister, UserLogin, TokenResponse, UserResponse
from app.utils.auth import hash_password, verify_password, create_access_token
from app.database import get_db
from bson import ObjectId

router = APIRouter()

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