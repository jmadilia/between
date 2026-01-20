from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_session_summaries():
  return []