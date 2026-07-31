from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config import settings

# ==========================
# Synchronous Database Engine
# ==========================
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True  # Automatically checks connection health
)

# ==========================
# Synchronous Session Factory
# ==========================
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)

# ==========================
# Base Model
# ==========================
Base = declarative_base()


# ==========================
# Dependency
# ==========================
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