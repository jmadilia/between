import os
import sys
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

# Default to a throwaway SQLite file; set TEST_DATABASE_URL to run against Postgres.
os.environ["DATABASE_URL"] = os.environ.get(
  "TEST_DATABASE_URL", f"sqlite:///{BACKEND_DIR / 'test.db'}"
)
os.environ["ANTHROPIC_API_KEY"] = ""


@pytest.fixture()
def client():
  from fastapi.testclient import TestClient

  from app.db.seed import reset_database
  from app.main import app

  reset_database()
  with TestClient(app) as c:
    yield c
