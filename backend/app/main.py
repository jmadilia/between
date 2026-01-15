from fastapi import FastAPI
from routers import users, reflections, session_summaries

app = FastAPI(title="Between API")

app.include_router(users.router)
app.include_router(reflections.router)
app.include_router(session_summaries.router)

@app.get("/health")
def health_check():
  return {"status": "ok"}