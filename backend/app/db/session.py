from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import settings

# Serverless functions (Vercel) are short-lived and Neon already pools
# connections on its side, so we open a fresh connection per session instead
# of holding a local pool that would be stranded between invocations.
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=NullPool,
    future=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)
