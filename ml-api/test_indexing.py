#!/usr/bin/env python3
"""
Direct test of database connection and vector indexing
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, joinedload
from app.models.database import Post, Editor, User
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_database_connection():
    """Test database connection and query posts"""
    try:
        # Create engine with URL encoding
        logger.info(f"Connecting to database: {settings.DATABASE_URL}")
        engine = create_engine(settings.DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        db = SessionLocal()
        
        # Test basic connection
        result = db.execute(text("SELECT 1")).scalar()
        logger.info(f"Database connection test: {result}")
        
        # Count total posts
        total_posts = db.query(Post).count()
        logger.info(f"Total posts in database: {total_posts}")
        
        # Count public posts
        public_posts = db.query(Post).filter(
            Post.deletedAt.is_(None),
            Post.status == 'PUBLIC'
        ).count()
        logger.info(f"Public posts: {public_posts}")
        
        # Get some posts with authors
        posts_with_authors = db.query(Post).options(
            joinedload(Post.editors).joinedload(Editor.user)
        ).filter(
            Post.deletedAt.is_(None),
            Post.status == 'PUBLIC'
        ).limit(5).all()
        
        logger.info(f"Found {len(posts_with_authors)} posts with authors")
        
        for post in posts_with_authors:
            logger.info(f"Post ID: {post.id}, Title: {post.title}")
            logger.info(f"Editors count: {len(post.editors)}")
            
            for editor in post.editors:
                logger.info(f"  Editor: {editor.user.name if editor.user else 'No user'} ({editor.role})")
            
            # Test author property
            author = post.author
            author_id = post.author_id
            logger.info(f"Author: {author.name if author else 'None'}, Author ID: {author_id}")
        
        db.close()
        return True
        
    except Exception as e:
        logger.error(f"Database test failed: {e}")
        return False

if __name__ == "__main__":
    logger.info("Starting database connection test...")
    success = test_database_connection()
    
    if success:
        logger.info("✅ Database connection test passed!")
    else:
        logger.error("❌ Database connection test failed!")
        sys.exit(1)
