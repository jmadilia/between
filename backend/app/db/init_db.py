from app.db.session import engine
from app.models.core_models import Base

from app.models.user import User
from app.models.reflection import Reflection
from app.models.session_summary import SessionSummary

def init_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()