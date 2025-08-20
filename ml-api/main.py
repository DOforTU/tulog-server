from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import search, embeddings, health
from app.core.config import settings
from contextlib import asynccontextmanager
import uvicorn
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables only if DB is available
try:
    from app.core.database import engine, Base
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified successfully")
except Exception as e:
    logger.warning(f"Database connection failed, continuing without DB: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        from app.core.ml_models import initialize_models
        await initialize_models()
        logger.info("ML models initialized successfully")
    except Exception as e:
        logger.warning(f"Failed to initialize ML models: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title="TULOG ML API",
    description="Machine Learning API for TULOG search and recommendations",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(search.router, prefix="/search", tags=["search"])
app.include_router(embeddings.router, prefix="/embeddings", tags=["embeddings"])

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True if settings.ENVIRONMENT == "development" else False
    )
