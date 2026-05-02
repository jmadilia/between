from fastapi import FastAPI
from routers import reflections, insights
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

register_routers(app)

@app.get("/health")
def health_check() -> dict:
  return {"status": "ok"}