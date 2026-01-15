from fastapi import APIRouter

router = APIRouter(prefix="/session-summaries", tags=["session-summaries"])

@router.get("/")
def list_session_summaries():
  return {"data": ["Session summaries router"]}