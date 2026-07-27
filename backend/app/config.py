from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "HireMind AI"
    debug: bool = True
    mongodb_url: str = "mongodb://localhost:27017"
    secret_key: str = "changethislater"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    gemini_api_key: str = ""
    groq_api_key: str = ""

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()