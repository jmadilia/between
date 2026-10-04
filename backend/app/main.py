import logging

from fastapi import FastAPI, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.seed import ensure_database
from routers import reflections, insights, patients, notes, soap_notes, dap_notes, onboarding, demo

logger = logging.getLogger(__name__)

app = FastAPI(title="Between API")

app.add_middleware(
  CORSMiddleware,
  allow_origins=settings.cors_origins,
  allow_methods=["*"],
  allow_headers=["*"],
)


@app.middleware("http")
async def bootstrap_and_strip_prefix(request: Request, call_next):
  # On Vercel the frontend calls the backend at /api/...; locally it calls the
  # routes directly. Serve both by dropping the prefix.
  path = request.scope["path"]
  if path == "/api" or path.startswith("/api/"):
    request.scope["path"] = path[len("/api"):] or "/"

  # Create tables and load demo data on first use of an empty database.
  if settings.AUTO_SEED and request.scope["path"] != "/health":
    try:
      await run_in_threadpool(ensure_database)
    except Exception:
      logger.exception("Database bootstrap failed")

  return await call_next(request)


def register_routers(app: FastAPI) -> None:
  app.include_router(reflections.router, prefix="/reflections", tags=["reflections"])
  app.include_router(insights.router, prefix="/insights", tags=["insights"])
  app.include_router(patients.router, prefix="/patients", tags=["patients"])
  app.include_router(notes.router, prefix="/notes", tags=["notes"])
  app.include_router(soap_notes.router, prefix="/soap-notes", tags=["soap-notes"])
  app.include_router(dap_notes.router, prefix="/dap-notes", tags=["dap-notes"])
  app.include_router(onboarding.router, prefix="/onboarding", tags=["onboarding"])
  app.include_router(demo.router, prefix="/demo", tags=["demo"])

register_routers(app)

@app.get("/health")
def health_check() -> dict:
  return {"status": "ok", "ai_enabled": bool(settings.ANTHROPIC_API_KEY)}
