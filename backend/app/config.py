from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "HireMind AI"
    debug: bool = True
    mongodb_url: str = "mongodb://localhost:27017"
    secret_key: str = "changethislater"

    class Config:
        env_file = ".env"

settings = Settings()

