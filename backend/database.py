from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Use environment variable for cloud deployment, fallback to local path
DB_PATH = os.environ.get('DATABASE_PATH', os.path.join(BASE_DIR, 'nail_art.db'))
DATABASE_URL = os.environ.get('DATABASE_URL', f"sqlite:///{DB_PATH}")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
