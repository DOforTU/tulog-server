from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.ml_models import get_ml_models
from app.models.schemas import HealthResponse

router = APIRouter()

@router.get("/", response_model=HealthResponse)
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    ml_models = get_ml_models()
    
    # Check database connection
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except:
        db_connected = False
    
    # Check if models are loaded
    models_loaded = (ml_models.embedding_model is not None and 
                    ml_models.vector_index is not None)
    
    # Get vector index size
    vector_index_size = len(ml_models.post_ids) if ml_models.post_ids else 0
    
    status = "healthy" if db_connected and models_loaded else "unhealthy"
    
    return HealthResponse(
        status=status,
        version="1.0.0",
        models_loaded=models_loaded,
        database_connected=db_connected,
        vector_index_size=vector_index_size
    )
