from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModel
import faiss
import numpy as np
import os
import pickle
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class MLModels:
    def __init__(self):
        self.embedding_model = None
        self.vector_index = None
        self.post_ids = []
        
    async def load_embedding_model(self):
        """Load the sentence transformer model for embeddings"""
        try:
            logger.info(f"Loading embedding model: {settings.MODEL_NAME}")
            self.embedding_model = SentenceTransformer(settings.MODEL_NAME)
            logger.info("Embedding model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise
    
    async def load_vector_index(self):
        """Load or create FAISS vector index"""
        try:
            index_path = f"{settings.VECTOR_DB_PATH}/{settings.INDEX_NAME}.index"
            ids_path = f"{settings.VECTOR_DB_PATH}/{settings.INDEX_NAME}_ids.pkl"
            
            if os.path.exists(index_path) and os.path.exists(ids_path):
                # Load existing index
                logger.info("Loading existing vector index")
                self.vector_index = faiss.read_index(index_path)
                with open(ids_path, 'rb') as f:
                    self.post_ids = pickle.load(f)
                logger.info(f"Vector index loaded with {len(self.post_ids)} posts")
            else:
                # Create new index
                logger.info("Creating new vector index")
                self.vector_index = faiss.IndexFlatIP(settings.EMBEDDING_DIMENSION)
                self.post_ids = []
                
                # Create directory if it doesn't exist
                os.makedirs(settings.VECTOR_DB_PATH, exist_ok=True)
                
                logger.info("New vector index created")
                
        except Exception as e:
            logger.error(f"Failed to load/create vector index: {e}")
            raise
    
    def save_vector_index(self):
        """Save the current vector index to disk"""
        try:
            index_path = f"{settings.VECTOR_DB_PATH}/{settings.INDEX_NAME}.index"
            ids_path = f"{settings.VECTOR_DB_PATH}/{settings.INDEX_NAME}_ids.pkl"
            
            faiss.write_index(self.vector_index, index_path)
            with open(ids_path, 'wb') as f:
                pickle.dump(self.post_ids, f)
                
            logger.info("Vector index saved successfully")
        except Exception as e:
            logger.error(f"Failed to save vector index: {e}")
            raise
    
    def generate_embeddings(self, texts):
        """Generate embeddings for given texts"""
        if not self.embedding_model:
            raise ValueError("Embedding model not loaded")
        
        embeddings = self.embedding_model.encode(texts, normalize_embeddings=True)
        return embeddings
    
    def add_to_index(self, embeddings, post_ids):
        """Add new embeddings to the vector index"""
        if not self.vector_index:
            raise ValueError("Vector index not initialized")
        
        embeddings = np.array(embeddings).astype('float32')
        self.vector_index.add(embeddings)
        self.post_ids.extend(post_ids)
        
        # Save after adding new vectors
        self.save_vector_index()
    
    def search_similar(self, query_embedding, k=None, min_similarity_threshold=None):
        """Search for similar posts using vector similarity"""
        if not self.vector_index:
            raise ValueError("Vector index not initialized")
        
        if k is None:
            k = min(settings.SEARCH_RESULTS_LIMIT, len(self.post_ids))
        
        if len(self.post_ids) == 0:
            return [], []
        
        # Ensure we don't request more results than available
        k = min(k, len(self.post_ids))
        
        query_embedding = np.array([query_embedding]).astype('float32')
        similarities, indices = self.vector_index.search(query_embedding, k)
        
        # Convert to lists
        similarity_scores = similarities[0].tolist()
        result_indices = indices[0].tolist()
        
        # Apply minimum similarity threshold only if specified
        if min_similarity_threshold is not None:
            valid_mask = [score >= min_similarity_threshold for score in similarity_scores]
            similarity_scores = [score for i, score in enumerate(similarity_scores) if valid_mask[i]]
            result_indices = [idx for i, idx in enumerate(result_indices) if valid_mask[i]]
        
        # Get corresponding post IDs
        result_post_ids = [self.post_ids[idx] for idx in result_indices]
        
        return result_post_ids, similarity_scores

# Global ML models instance
ml_models = MLModels()

async def initialize_models():
    """Initialize all ML models"""
    logger.info("Initializing ML models...")
    await ml_models.load_embedding_model()
    await ml_models.load_vector_index()
    logger.info("ML models initialized successfully")

def get_ml_models() -> MLModels:
    """Get the global ML models instance"""
    return ml_models
