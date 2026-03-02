from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import secrets
import logging

logger = logging.getLogger(__name__)

_INSECURE_DEFAULT_KEY = "changeme-use-a-long-random-string"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    ENVIRONMENT: str = "development"
    DEBUG: bool = False  # Always False by default; set DEBUG=true in .env for dev

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://devtaskr:devtaskr_password@localhost:5432/devtaskr"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Auth
    SECRET_KEY: str = _INSECURE_DEFAULT_KEY
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:80",
        "http://localhost",
    ]


settings = Settings()

if settings.SECRET_KEY == _INSECURE_DEFAULT_KEY:
    if settings.ENVIRONMENT == "production":
        raise RuntimeError(
            "SECRET_KEY must be set to a secure random value in production. "
            "Generate one with: python -c \"import secrets; print(secrets.token_hex(64))\""
        )
    else:
        logger.warning(
            "Using insecure default SECRET_KEY. Set SECRET_KEY in your .env file before deploying."
        )

if settings.DEBUG and settings.ENVIRONMENT == "production":
    logger.warning("DEBUG=true in a production environment — this is a security risk.")
