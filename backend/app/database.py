from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True  # Automatically checks connection health
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Database session dependency for FastAPI routes.
    Yields a database session and ensures it is closed after request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
