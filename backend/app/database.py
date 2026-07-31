from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import declarative_base

from app.config import settings

# ==========================
# Async Database Engine
# ==========================
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
)

# ==========================
# Async Session Factory
# ==========================
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)

# ==========================
# Base Model
# ==========================
Base = declarative_base()


# ==========================
# Dependency
# ==========================
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session