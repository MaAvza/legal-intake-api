import os
from typing import List
from functools import lru_cache

class Settings:
    """
    Application settings with validation.
    Loads from environment variables or .env file.
    """
    
    def __init__(self):
        # Load .env file if it exists
        self._load_env_file()
        
        # ===== Database =====
        self.DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./legal_intake.db")
        
        # ===== Security =====
        self.SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
        self.ALGORITHM = os.getenv("ALGORITHM", "HS256")
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        
        # ===== Email =====
        self.SMTP_HOST = os.getenv("SMTP_HOST")
        self.SMTP_PORT = int(os.getenv("SMTP_PORT", "587")) if os.getenv("SMTP_PORT") else 587
        self.SMTP_USERNAME = os.getenv("SMTP_USERNAME")
        self.SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
        self.LAWYER_EMAIL = os.getenv("LAWYER_EMAIL", "mail@gmail.com")
        
        # ===== Application =====
        self.APP_NAME = os.getenv("APP_NAME", "Legal Intake API")
        self.APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
        self.DEBUG = os.getenv("DEBUG", "False").lower() == "true"
        
        # ===== CORS Configuration =====
        # Default now includes common local ports. 
        # In production, set ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
        self.ALLOWED_ORIGINS_STR = os.getenv(
            "ALLOWED_ORIGINS", 
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
        )
        
        # ===== Rate Limiting =====
        self.RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "True").lower() == "true"
        self.RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
        
        self._validate_settings()
    
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        """
        Parses the comma-separated string into a list of origins.
        Ensures no trailing slashes, as CORS is sensitive to them.
        """
        return [origin.strip().rstrip('/') for origin in self.ALLOWED_ORIGINS_STR.split(",") if origin.strip()]
    
    def _load_env_file(self):
        try:
            from dotenv import load_dotenv
            load_dotenv()
        except ImportError:
            pass
    
    def _validate_settings(self):
        if self.SECRET_KEY == 'your-secret-key-change-in-production' and not self.DEBUG:
            print("CRITICAL WARNING: SECRET_KEY is insecure! Change it for production.")

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()

# Legacy exports
DATABASE_URL = settings.DATABASE_URL
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
ALLOWED_ORIGINS = settings.ALLOWED_ORIGINS