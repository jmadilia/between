from fastapi import APIRouter

router = APIRouter(prefix="/reflections", tags=["reflections"])

@router.get("/")
def list_reflections():
  return {"data": ["Reflections router"]}