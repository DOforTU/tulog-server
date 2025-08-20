from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Database Configuration - 환경변수에서만 가져오도록 설정
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_USERNAME: str = os.getenv("DB_USERNAME", "your_db_username")  # 더미값
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "your_db_password")  # 더미값
    DB_DATABASE: str = os.getenv("DB_DATABASE", "your_database_name")  # 더미값
    DB_SCHEMA: str = os.getenv("DB_SCHEMA", "public")
    
    # Application Configuration
    PORT: int = int(os.getenv("PORT", "8001"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    API_SERVER_URL: str = os.getenv("API_SERVER_URL", "http://localhost:8000")
    
    # Redis Configuration  
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_PASSWORD: Optional[str] = os.getenv("REDIS_PASSWORD")  # None이 안전한 기본값
    
    # ML Model Configuration
    MODEL_NAME: str = os.getenv("MODEL_NAME", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    EMBEDDING_DIMENSION: int = int(os.getenv("EMBEDDING_DIMENSION", "384"))
    SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.7"))
    SEARCH_RESULTS_LIMIT: int = int(os.getenv("SEARCH_RESULTS_LIMIT", "20"))
    
    # Vector Database Configuration
    VECTOR_DB_PATH: str = os.getenv("VECTOR_DB_PATH", "./data/vector_db")
    INDEX_NAME: str = os.getenv("INDEX_NAME", "posts_index")
    
    @field_validator('DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE')
    def validate_db_credentials(cls, v, info):
        """환경변수가 더미값인지 검증"""
        dummy_values = ["your_db_username", "your_db_password", "your_database_name"]
        if v in dummy_values:
            raise ValueError(f"환경변수 {info.field_name}이 설정되지 않았습니다. .env 파일을 확인하세요.")
        return v
    
    # ML Model Configuration
    MODEL_NAME: str = os.getenv("MODEL_NAME", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    EMBEDDING_DIMENSION: int = int(os.getenv("EMBEDDING_DIMENSION", "384"))
    SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.7"))
    SEARCH_RESULTS_LIMIT: int = int(os.getenv("SEARCH_RESULTS_LIMIT", "20"))
    
    # Vector Database Configuration
    VECTOR_DB_PATH: str = os.getenv("VECTOR_DB_PATH", "./data/vector_db")
    INDEX_NAME: str = os.getenv("INDEX_NAME", "posts_index")
    
    @property
    def DATABASE_URL(self) -> str:
        # URL encode the password to handle special characters like @
        import urllib.parse
        encoded_password = urllib.parse.quote(self.DB_PASSWORD, safe='')
        return f"postgresql+psycopg2://{self.DB_USERNAME}:{encoded_password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_DATABASE}"
    
    @property
    def REDIS_URL(self) -> str:
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}"

settings = Settings()
