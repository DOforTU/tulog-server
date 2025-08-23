from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.core.database import get_db
from app.core.ml_models import get_ml_models
from app.models.database import Post, User, Team, Tag, PostTag, Editor
from app.models.schemas import SearchRequest, SearchResponse, SearchResult
import time
from typing import List

router = APIRouter()

@router.post("/semantic", response_model=SearchResponse)
async def semantic_search(
    search_request: SearchRequest,
    db: Session = Depends(get_db)
):
    """Perform semantic search using ML models"""
    start_time = time.time()
    ml_models = get_ml_models()
    
    if not ml_models.embedding_model or not ml_models.vector_index:
        raise HTTPException(status_code=503, detail="ML models not initialized")
    
    try:
        # Generate embedding for search query
        query_embedding = ml_models.generate_embeddings([search_request.query])[0]
        
        # Use similarity threshold only if provided, otherwise get top results
        min_threshold = getattr(search_request, 'similarity_threshold', None)
        
        # Search for similar posts
        similar_post_ids, similarities = ml_models.search_similar(
            query_embedding, 
            k=search_request.limit,
            min_similarity_threshold=min_threshold
        )
        
        if not similar_post_ids:
            return SearchResponse(
                query=search_request.query,
                results=[],
                total_found=0,
                search_time=time.time() - start_time
            )
        
        # Query database for post details with author info
        query = db.query(Post, Team, User).outerjoin(
            Team, Post.teamId == Team.id
        ).outerjoin(
            Editor, and_(Post.id == Editor.postId, Editor.role == 'OWNER')
        ).outerjoin(
            User, Editor.userId == User.id
        ).filter(
            and_(
                Post.id.in_(similar_post_ids),
                Post.deletedAt.is_(None),
                Post.status == 'PUBLIC'  # Using PUBLIC status
            )
        )
        
        # Apply filters
        if search_request.team_id:
            query = query.filter(Post.teamId == search_request.team_id)
        if search_request.author_id:
            query = query.filter(User.id == search_request.author_id)
        
        posts_data = query.all()
        
        # Create results with similarity scores
        results = []
        post_similarity_map = dict(zip(similar_post_ids, similarities))
        
        for post, team, author in posts_data:
            # Get tags if requested
            tags = []
            if search_request.include_tags:
                post_tags = db.query(Tag).join(PostTag).filter(
                    PostTag.postId == post.id
                ).all()
                tags = [tag.name for tag in post_tags]
            
            result = SearchResult(
                post_id=post.id,
                #title=post.title,
                #content=post.content[:500] + "..." if len(post.content) > 500 else post.content,
                #author_nickname=author.nickname if author else "Unknown",
                #team_name=team.name if team else None,
                #tags=tags,
                similarity_score=post_similarity_map.get(post.id, 0.0),
                #created_at=post.createdAt
            )
            results.append(result)
        
        # Sort by similarity score
        results.sort(key=lambda x: x.similarity_score, reverse=True)
        
        return SearchResponse(
            query=search_request.query,
            results=results,
            total_found=len(results),
            search_time=time.time() - start_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.post("/hybrid", response_model=SearchResponse)
async def hybrid_search(
    search_request: SearchRequest,
    db: Session = Depends(get_db)
):
    """Perform hybrid search combining semantic and keyword search"""
    start_time = time.time()
    ml_models = get_ml_models()
    
    if not ml_models.embedding_model or not ml_models.vector_index:
        raise HTTPException(status_code=503, detail="ML models not initialized")
    
    try:
        # Perform semantic search
        query_embedding = ml_models.generate_embeddings([search_request.query])[0]
        
        # Use similarity threshold only if provided
        min_threshold = getattr(search_request, 'similarity_threshold', None)
        
        semantic_post_ids, semantic_similarities = ml_models.search_similar(
            query_embedding, 
            k=search_request.limit * 2,  # Get more results for hybrid ranking
            min_similarity_threshold=min_threshold
        )
        
        # Perform keyword search
        keyword_query = db.query(Post, Team, User).outerjoin(
            Team, Post.teamId == Team.id
        ).outerjoin(
            Editor, and_(Post.id == Editor.postId, Editor.role == 'OWNER')
        ).outerjoin(
            User, Editor.userId == User.id
        ).filter(
            and_(
                or_(
                    Post.title.ilike(f"%{search_request.query}%"),
                    Post.content.ilike(f"%{search_request.query}%")
                ),
                Post.deletedAt.is_(None),
                Post.status == 'PUBLIC'
            )
        )
        
        # Apply filters for keyword search
        if search_request.team_id:
            keyword_query = keyword_query.filter(Post.teamId == search_request.team_id)
        if search_request.author_id:
            keyword_query = keyword_query.filter(User.id == search_request.author_id)
        
        keyword_posts = keyword_query.all()
        keyword_post_ids = [post.id for post, _, _ in keyword_posts]
        
        # Combine results
        combined_post_ids = list(set(semantic_post_ids + keyword_post_ids))
        
        if not combined_post_ids:
            return SearchResponse(
                query=search_request.query,
                results=[],
                total_found=0,
                search_time=time.time() - start_time
            )
        
        # Query for all combined results
        all_posts_query = db.query(Post, Team, User).outerjoin(
            Team, Post.teamId == Team.id
        ).outerjoin(
            Editor, and_(Post.id == Editor.postId, Editor.role == 'OWNER')
        ).outerjoin(
            User, Editor.userId == User.id
        ).filter(Post.id.in_(combined_post_ids))
        
        all_posts_data = all_posts_query.all()
        
        # Create results with hybrid scoring
        results = []
        semantic_similarity_map = dict(zip(semantic_post_ids, semantic_similarities))
        
        for post, team, author in all_posts_data:
            # Calculate hybrid score
            semantic_score = semantic_similarity_map.get(post.id, 0.0)
            keyword_score = 1.0 if post.id in keyword_post_ids else 0.0
            
            # Weighted hybrid score (60% semantic, 40% keyword)
            hybrid_score = 0.6 * semantic_score + 0.4 * keyword_score
            
            # Get tags if requested
            tags = []
            if search_request.include_tags:
                post_tags = db.query(Tag).join(PostTag).filter(
                    PostTag.postId == post.id
                ).all()
                tags = [tag.name for tag in post_tags]
            
            result = SearchResult(
                post_id=post.id,
                title=post.title,
                content=post.content[:500] + "..." if len(post.content) > 500 else post.content,
                author_nickname=author.nickname if author else "Unknown",
                team_name=team.name if team else None,
                tags=tags,
                similarity_score=hybrid_score,
                created_at=post.createdAt
            )
            results.append(result)
        
        # Sort by hybrid score and limit results
        results.sort(key=lambda x: x.similarity_score, reverse=True)
        results = results[:search_request.limit]
        
        return SearchResponse(
            query=search_request.query,
            results=results,
            total_found=len(results),
            search_time=time.time() - start_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hybrid search failed: {str(e)}")
