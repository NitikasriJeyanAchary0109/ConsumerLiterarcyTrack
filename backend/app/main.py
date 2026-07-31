from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import uvicorn

from app.database import engine, Base, get_db
from app.config import settings
from app.routers import auth, transactions, goals, roundups, chat, negotiator, forecast, stress, educator, coach

# Initialize FastAPI application
app = FastAPI(
    title="SpareChange AI API",
    description="Backend API services for micro-savings and automated financial advice.",
    version="2.0.0"
)

# Configure Session Middleware for Google OAuth state retention
app.add_middleware(
    SessionMiddleware, 
    secret_key=settings.JWT_SECRET
)

# Configure CORS - Restricted to local Expo dev servers, no wildcards.
# 8081 is the default port for Expo Metro Bundler.
origins = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:19000",
    "http://127.0.0.1:19000",
    "http://localhost:19006",  # Expo Web default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Base healthcheck endpoint
@app.get("/api/health")
def healthcheck(db: Session = Depends(get_db)):
    """
    Checks the API status and attempts a simple query against PostgreSQL
    to verify that the database connection is alive.
    """
    db_status = "unhealthy"
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
        
    return {
        "status": "online",
        "database": db_status,
        "environment": settings.ENVIRONMENT,
        "ollama_config": {
            "endpoint": settings.OLLAMA_URL,
            "model": settings.OLLAMA_MODEL
        }
    }

# Mount sub-routers under the /api path prefix
app.include_router(auth.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(goals.router, prefix="/api")
app.include_router(roundups.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(negotiator.router, prefix="/api")
app.include_router(forecast.router, prefix="/api")
app.include_router(stress.router, prefix="/api")
app.include_router(educator.router, prefix="/api")
app.include_router(coach.router,    prefix="/api")

# Automatically generate database tables on startup if running in development mode
if settings.ENVIRONMENT == "development":
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
