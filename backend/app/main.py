from fastapi import FastAPI
from routers import reflections, insights, patients, notes, soap_notes, dap_notes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Between API")

app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:5173"],
  allow_methods=["*"],
  allow_headers=["*"]
)

def register_routers(app: FastAPI) -> None:
  app.include_router(reflections.router, prefix="/reflections", tags=["reflections"])
  app.include_router(insights.router, prefix="/insights", tags=["insights"])
  app.include_router(patients.router, prefix="/patients", tags=["patients"])
  app.include_router(notes.router, prefix="/notes", tags=["notes"])
  app.include_router(soap_notes.router, prefix="/soap-notes", tags=["soap-notes"])
  app.include_router(dap_notes.router, prefix="/dap-notes", tags=["dap-notes"])

register_routers(app)

@app.get("/health")
def health_check() -> dict:
  return {"status": "ok"}