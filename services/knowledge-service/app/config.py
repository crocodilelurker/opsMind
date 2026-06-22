import os

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")
    PROJECT_SERVICE_URL: str = os.getenv("PROJECT_SERVICE_URL", "http://project-service:8000")

settings = Settings()