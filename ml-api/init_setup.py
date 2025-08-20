"""
TULOG ML API - 초기화 스크립트

이 스크립트는 다음을 수행합니다:
1. 데이터베이스 연결 테스트
2. ML 모델 초기화
3. 기존 포스트에 대한 벡터 인덱스 생성
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine
from app.core.ml_models import initialize_models, get_ml_models
from app.models.database import Post, User, Team, Base
from sqlalchemy import and_
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_database_connection():
    """데이터베이스 연결 테스트"""
    try:
        from sqlalchemy import text
        db = SessionLocal()
        result = db.execute(text("SELECT COUNT(*) FROM server_api.post WHERE \"deletedAt\" IS NULL"))
        count = result.scalar()
        logger.info(f"Database connected successfully. Found {count} active posts.")
        db.close()
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False

async def initialize_vector_index():
    """기존 포스트에 대한 벡터 인덱스 초기화"""
    try:
        ml_models = get_ml_models()
        db = SessionLocal()
        
        # Get all public posts
        posts_query = db.query(Post, User, Team).join(
            User, Post.author_id == User.id
        ).outerjoin(
            Team, Post.team_id == Team.id
        ).filter(
            and_(
                Post.deleted_at.is_(None),
                Post.is_public == True
            )
        ).limit(1000)  # 초기에는 1000개만 처리
        
        posts_data = posts_query.all()
        
        if not posts_data:
            logger.info("No posts found for initial indexing")
            return
        
        logger.info(f"Starting initial indexing for {len(posts_data)} posts...")
        
        # Process in batches
        batch_size = 50
        total_processed = 0
        
        for i in range(0, len(posts_data), batch_size):
            batch = posts_data[i:i + batch_size]
            
            texts = []
            post_ids = []
            
            for post, author, team in batch:
                text = f"{post.title} {post.content}"
                texts.append(text)
                post_ids.append(post.id)
            
            # Generate embeddings
            embeddings = ml_models.generate_embeddings(texts)
            
            # Add to index
            ml_models.add_to_index(embeddings, post_ids)
            
            total_processed += len(post_ids)
            logger.info(f"Processed {total_processed}/{len(posts_data)} posts")
        
        logger.info(f"Initial indexing completed. Total posts indexed: {total_processed}")
        db.close()
        
    except Exception as e:
        logger.error(f"Failed to initialize vector index: {e}")

async def main():
    """메인 초기화 함수"""
    logger.info("Starting TULOG ML API initialization...")
    
    # 1. 데이터베이스 연결 테스트
    logger.info("Testing database connection...")
    if not await test_database_connection():
        logger.error("Exiting due to database connection failure")
        return
    
    # 2. ML 모델 초기화
    logger.info("Initializing ML models...")
    await initialize_models()
    
    # 3. 벡터 인덱스 초기화
    logger.info("Initializing vector index...")
    await initialize_vector_index()
    
    logger.info("Initialization completed successfully!")
    logger.info("You can now start the FastAPI server with: python main.py")

if __name__ == "__main__":
    asyncio.run(main())
