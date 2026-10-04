from pathlib import Path

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
  model_config = SettingsConfigDict(
    # Local dev reads backend/.env (or the repo-root .env); on Vercel the
    # values come straight from the project's environment variables.
    env_file=(BACKEND_DIR.parent / ".env", BACKEND_DIR / ".env"),
    extra="ignore",
  )

  # The Vercel + Neon integration exposes DATABASE_URL and POSTGRES_URL;
  # accept either so the deployment works without renaming anything.
  DATABASE_URL: str = Field(validation_alias=AliasChoices("DATABASE_URL", "POSTGRES_URL"))
  ANTHROPIC_API_KEY: str | None = None
  ANTHROPIC_MODEL: str = "claude-opus-4-7"

  # Comma-separated list of extra origins allowed by CORS. Same-origin
  # requests on Vercel (frontend calling /api) don't need an entry here.
  CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

  # Create tables and load the demo dataset on startup when the database is
  # empty. Safe to leave on: it never touches a database that already has users.
  AUTO_SEED: bool = True

  @field_validator("DATABASE_URL")
  @classmethod
  def normalize_database_url(cls, url: str) -> str:
    # Neon and Vercel hand out postgres:// URLs, which SQLAlchemy 2 rejects.
    if url.startswith("postgres://"):
      url = "postgresql://" + url[len("postgres://"):]
    return url

  @property
  def cors_origins(self) -> list[str]:
    return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
