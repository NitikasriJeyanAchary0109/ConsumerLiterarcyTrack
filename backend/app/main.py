from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import engine, Base, get_db
from app.routers import (
    auth,
    transactions,
    goals,
    roundups,
    chat,
    negotiator,
    forecast,
    stress,
    educator,
    savings,
    coach,          # feat-aimodel: AI Coach router
)


# ==========================
# Startup / Shutdown
# ==========================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database tables exist
    Base.metadata.create_all(bind=engine)

    yield


# ==========================
# FastAPI App
# ==========================
app = FastAPI(
    title="SpareChange AI API",
    description="Backend API services for micro-savings and automated financial advice.",
    version="2.0.0",
    lifespan=lifespan,
)

# ==========================
# Session Middleware
# ==========================
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.JWT_SECRET,
)

# ==========================
# CORS
# ==========================
origins = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:19000",
    "http://127.0.0.1:19000",
    "http://localhost:19006",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# Health Check
# ==========================
@app.get("/api/health")
async def healthcheck(db: Session = Depends(get_db)):
    db_status = "healthy"

    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "online",
        "database": db_status,
        "environment": settings.ENVIRONMENT,
        "ollama": {
            "endpoint": settings.OLLAMA_URL,
            "model": settings.OLLAMA_MODEL,
        },
    }


# ==========================
# Routers
# ==========================
app.include_router(auth.router,         prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(goals.router,        prefix="/api")
app.include_router(roundups.router,     prefix="/api")
app.include_router(chat.router,         prefix="/api")
app.include_router(negotiator.router,   prefix="/api")
app.include_router(forecast.router,     prefix="/api")
app.include_router(stress.router,       prefix="/api")
app.include_router(educator.router,     prefix="/api")
app.include_router(savings.router,      prefix="/api")   # from main
app.include_router(coach.router,        prefix="/api")   # from feat-aimodel


# ==========================
# Static Frontend Serving
# ==========================
import os
dist_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dist")
if os.path.exists(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="frontend")


# ==========================
# Run Server
# ==========================
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
