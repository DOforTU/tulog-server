#!/usr/bin/env python3
"""
Initialize vector index with all posts
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, joinedload
from app.models.database import Post, Editor, User
from app.core.config import settings
from app.core.ml_models import MLModels
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def initialize_vector_index():
    """Initialize vector index with all public posts"""
    try:
        # Initialize ML models
        logger.info("Initializing ML models...")
        ml_models = MLModels()
        
        # Load embedding model synchronously  
        logger.info(f"Loading embedding model: {settings.MODEL_NAME}")
        from sentence_transformers import SentenceTransformer
        ml_models.embedding_model = SentenceTransformer(settings.MODEL_NAME)
        logger.info("Embedding model loaded successfully")
        
        # Initialize vector index
        import faiss
        ml_models.vector_index = faiss.IndexFlatIP(settings.EMBEDDING_DIMENSION)
        ml_models.post_ids = []
        logger.info("Vector index created")
        
        # Create database connection
        logger.info(f"Connecting to database: {settings.DATABASE_URL}")
        engine = create_engine(settings.DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Get all public posts with authors
        logger.info("Fetching public posts...")
        posts_query = db.query(Post).options(
            joinedload(Post.editors).joinedload(Editor.user)
        ).filter(
            Post.deletedAt.is_(None),
            Post.status == 'PUBLIC'
        )
        
        posts_data = posts_query.all()
        logger.info(f"Found {len(posts_data)} public posts")
        
        if not posts_data:
            logger.warning("No posts found for indexing")
            return False
        
        # Process posts in batches
        batch_size = 10
        total_processed = 0
        
        for i in range(0, len(posts_data), batch_size):
            batch = posts_data[i:i + batch_size]
            
            texts = []
            post_ids = []
            
            for post in batch:
                # Combine title and content for embedding
                text = f"{post.title} {post.content[:500]}"  # Limit content length
                texts.append(text)
                post_ids.append(post.id)
                
                # Log post info
                author = post.author
                logger.info(f"Processing Post {post.id}: '{post.title}' by {author.name if author else 'Unknown'}")
            
            # Generate embeddings for batch
            logger.info(f"Generating embeddings for batch {i//batch_size + 1}...")
            embeddings = ml_models.generate_embeddings(texts)
            logger.info(f"Generated {len(embeddings)} embeddings")
            
            # Add to index
            ml_models.add_to_index(embeddings, post_ids)
            
            total_processed += len(post_ids)
            logger.info(f"Processed {total_processed}/{len(posts_data)} posts")
        
        # Save index
        logger.info("Saving vector index...")
        ml_models.save_vector_index()
        
        # Final statistics
        logger.info(f"✅ Index initialization completed!")
        logger.info(f"📊 Total posts indexed: {total_processed}")
        logger.info(f"📐 Index dimension: {ml_models.vector_index.d if ml_models.vector_index else 0}")
        logger.info(f"🔍 Model: {settings.MODEL_NAME}")
        
        db.close()
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize vector index: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    logger.info("🚀 Starting vector index initialization...")
    success = initialize_vector_index()
    
    if success:
        logger.info("🎉 Vector index initialization completed successfully!")
    else:
        logger.error("💥 Vector index initialization failed!")
        sys.exit(1)
