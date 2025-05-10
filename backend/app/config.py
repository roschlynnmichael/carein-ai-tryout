from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    DATABASE_URL: str = "sqlite:///./carein.db"
    
    class Config:
        env_file = ".env"

settings = Settings()

