"""Reset the database to the demo dataset.

Usage (from backend/):  python -m app.db.init_db
"""
from app.db.seed import reset_database


if __name__ == "__main__":
    reset_database()
    print("Database reset and demo data loaded.")
