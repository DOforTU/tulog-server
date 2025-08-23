from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 20
    include_tags: Optional[bool] = True
    team_id: Optional[int] = None
    author_id: Optional[int] = None

class SearchResult(BaseModel):
    post_id: int
    #title: str
    #content: str
    #author_nickname: str
    #team_name: Optional[str]
    #tags: List[str]
    similarity_score: float
    #created_at: datetime

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total_found: int
    search_time: float

class EmbeddingRequest(BaseModel):
    texts: List[str]

class EmbeddingResponse(BaseModel):
    embeddings: List[List[float]]
    dimension: int

class IndexUpdateRequest(BaseModel):
    post_ids: Optional[List[int]] = None
    force_rebuild: Optional[bool] = False

class IndexUpdateResponse(BaseModel):
    success: bool
    message: str
    posts_indexed: int
    total_posts: int

class HealthResponse(BaseModel):
    status: str
    version: str
    models_loaded: bool
    database_connected: bool
    vector_index_size: int
