from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from app.core.database import get_db
from app.core.ml_models import get_ml_models
from app.models.database import Post, User, Team, Editor
from app.models.schemas import (
    EmbeddingRequest, EmbeddingResponse, 
    IndexUpdateRequest, IndexUpdateResponse
)
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate", response_model=EmbeddingResponse)
async def generate_embeddings(request: EmbeddingRequest):
    """Generate embeddings for given texts"""
    ml_models = get_ml_models()
    
    if not ml_models.embedding_model:
        raise HTTPException(status_code=503, detail="Embedding model not initialized")
    
    try:
        embeddings = ml_models.generate_embeddings(request.texts)
        
        return EmbeddingResponse(
            embeddings=embeddings.tolist(),
            dimension=embeddings.shape[1]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate embeddings: {str(e)}")

@router.post("/update-index", response_model=IndexUpdateResponse)
async def update_vector_index(
    request: IndexUpdateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Update the vector index with new or modified posts"""
    ml_models = get_ml_models()
    
    if not ml_models.embedding_model or not ml_models.vector_index:
        raise HTTPException(status_code=503, detail="ML models not initialized")
    
    try:
        if request.force_rebuild:
            # Rebuild entire index
            background_tasks.add_task(rebuild_entire_index, db)
            return IndexUpdateResponse(
                success=True,
                message="Index rebuild started in background",
                posts_indexed=0,
                total_posts=0
            )
        else:
            # Update specific posts or all new posts
            posts_query = db.query(Post).options(
                joinedload(Post.editors).joinedload(Editor.user)
            ).filter(
                and_(
                    Post.deletedAt.is_(None),
                    Post.status == 'PUBLIC'
                )
            )
            
            if request.post_ids:
                posts_query = posts_query.filter(Post.id.in_(request.post_ids))
            
            posts_data = posts_query.all()
            
            if not posts_data:
                return IndexUpdateResponse(
                    success=True,
                    message="No posts found to index",
                    posts_indexed=0,
                    total_posts=0
                )
            
            # Generate embeddings for posts
            texts = []
            post_ids = []
            
            for post in posts_data:
                # Combine title and content for embedding
                text = f"{post.title} {post.content}"
                texts.append(text)
                post_ids.append(post.id)
            
            # Generate embeddings
            embeddings = ml_models.generate_embeddings(texts)
            
            # Add to vector index
            ml_models.add_to_index(embeddings, post_ids)
            
            return IndexUpdateResponse(
                success=True,
                message=f"Successfully indexed {len(post_ids)} posts",
                posts_indexed=len(post_ids),
                total_posts=len(ml_models.post_ids)
            )
            
    except Exception as e:
        logger.error(f"Failed to update index: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update index: {str(e)}")

async def rebuild_entire_index(db: Session):
    """Background task to rebuild the entire vector index"""
    try:
        ml_models = get_ml_models()
        logger.info("Starting full index rebuild...")
        
        # Clear existing index
        ml_models.vector_index.reset()
        ml_models.post_ids = []
        
        # Get all public posts with authors
        posts_query = db.query(Post).options(
            joinedload(Post.editors).joinedload(Editor.user)
        ).filter(
            and_(
                Post.deletedAt.is_(None),
                Post.status == 'PUBLIC'
            )
        )
        
        posts_data = posts_query.all()
        
        if not posts_data:
            logger.info("No posts found for indexing")
            return
        
        # Process posts in batches
        batch_size = 100
        total_processed = 0
        
        for i in range(0, len(posts_data), batch_size):
            batch = posts_data[i:i + batch_size]
            
            texts = []
            post_ids = []
            
            for post in batch:
                text = f"{post.title} {post.content}"
                texts.append(text)
                post_ids.append(post.id)
            
            # Generate embeddings for batch
            embeddings = ml_models.generate_embeddings(texts)
            
            # Add to index
            ml_models.add_to_index(embeddings, post_ids)
            
            total_processed += len(post_ids)
            logger.info(f"Processed {total_processed}/{len(posts_data)} posts")
        
        logger.info(f"Index rebuild completed. Total posts indexed: {total_processed}")
        
    except Exception as e:
        logger.error(f"Failed to rebuild index: {e}")

@router.get("/index-stats")
async def get_index_stats():
    """Get statistics about the current vector index"""
    ml_models = get_ml_models()
    
    return {
        "total_posts": len(ml_models.post_ids),
        "index_dimension": ml_models.vector_index.d if ml_models.vector_index else 0,
        "model_name": "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    }
