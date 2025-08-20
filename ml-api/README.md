# TULOG ML API

FastAPI 서버로 구현된 TULOG의 머신러닝 및 검색 엔진 API입니다.

## 주요 기능

-   **의미 기반 검색**: Sentence Transformers를 사용한 시맨틱 검색
-   **하이브리드 검색**: 키워드 검색과 의미 검색을 결합
-   **벡터 인덱싱**: FAISS를 사용한 효율적인 벡터 검색
-   **실시간 임베딩**: 텍스트에 대한 실시간 임베딩 생성

## 설치 및 실행

1. 의존성 설치:

```bash
pip install -r requirements.txt
```

2. 환경 변수 설정:
   `.env` 파일에서 데이터베이스 및 기타 설정을 확인하세요.

3. 서버 실행:

```bash
python main.py
```

또는

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

## API 엔드포인트

### Health Check

#### `GET /health/` - 서버 상태 확인

**응답 예시:**

````json
{
    "status": "healthy",
    "timestamp": "2025-08-20T21:30:00Z",
    "version": "1.0.0",
    "database_connected": true,
    "ml_models_loaded": true,
    "vector_index_ready": true,
    "total_indexed_posts": 40
}

### 검색

#### `POST /search/semantic` - 의미 기반 검색

**요청 Body:**
```json
{
    "query": "NestJS 마이크로서비스 아키텍처",
    "limit": 10,
    "similarity_threshold": 0.7
}
````

**응답 예시:**

```json
{
    "success": true,
    "query": "NestJS 마이크로서비스 아키텍처",
    "results": [
        {
            "post_id": 1,
            "title": "Advanced NestJS Microservices Architecture",
            "excerpt": "Learn how to build scalable microservices...",
            "author_name": "Sarah Chen",
            "similarity_score": 0.92,
            "created_at": "2025-01-15T10:30:00Z"
        },
        {
            "post_id": 3,
            "title": "Building Scalable REST APIs with NestJS",
            "excerpt": "Complete guide to REST API development...",
            "author_name": "Alex Jones",
            "similarity_score": 0.85,
            "created_at": "2025-02-01T14:20:00Z"
        }
    ],
    "total_results": 2,
    "search_time_ms": 45
}
```

#### `POST /search/hybrid` - 하이브리드 검색

**요청 Body:**

```json
{
    "query": "Python 머신러닝",
    "limit": 10,
    "similarity_threshold": 0.6,
    "keyword_weight": 0.3,
    "semantic_weight": 0.7
}
```

**응답 예시:**

```json
{
    "success": true,
    "query": "Python 머신러닝",
    "results": [
        {
            "post_id": 16,
            "title": "Introduction to Machine Learning with Python",
            "excerpt": "Comprehensive guide to ML fundamentals...",
            "author_name": "Kai Mitchell",
            "similarity_score": 0.89,
            "keyword_score": 0.95,
            "hybrid_score": 0.91,
            "created_at": "2025-03-10T09:15:00Z"
        },
        {
            "post_id": 17,
            "title": "Deep Learning with TensorFlow and Keras",
            "excerpt": "Advanced neural networks implementation...",
            "author_name": "Anna Thompson",
            "similarity_score": 0.82,
            "keyword_score": 0.78,
            "hybrid_score": 0.81,
            "created_at": "2025-03-15T16:45:00Z"
        }
    ],
    "total_results": 2,
    "search_time_ms": 67
}
```

### 임베딩

#### `POST /embeddings/generate` - 텍스트 임베딩 생성

**요청 Body:**

```json
{
    "texts": [
        "NestJS는 효율적이고 확장 가능한 Node.js 서버 사이드 애플리케이션을 구축하기 위한 프레임워크입니다.",
        "FastAPI는 Python으로 API를 빠르게 구축할 수 있는 모던한 웹 프레임워크입니다."
    ]
}
```

**응답 예시:**

```json
{
    "embeddings": [
        [0.123, -0.456, 0.789, ...], // 384차원 벡터
        [0.321, -0.654, 0.987, ...] // 384차원 벡터
    ],
    "dimension": 384
}
```

#### `POST /embeddings/update-index` - 벡터 인덱스 업데이트

**요청 Body:**

```json
{
    "post_ids": [1, 2, 3], // 특정 포스트만 업데이트 (선택사항)
    "force_rebuild": false // 전체 인덱스 재구축 여부
}
```

**응답 예시:**

```json
{
    "success": true,
    "message": "Successfully indexed 3 posts",
    "posts_indexed": 3,
    "total_posts": 40
}
```

#### `GET /embeddings/index-stats` - 인덱스 통계

**응답 예시:**

````json
{
    "total_posts": 40,
    "index_dimension": 384,
    "model_name": "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
}

## 매개변수 설명

### 검색 매개변수
- **query** (required): 검색할 텍스트
- **limit** (optional, default: 20): 반환할 결과 수
- **similarity_threshold** (optional): 유사도 임계값 (0.0 ~ 1.0). 지정하지 않으면 상위 N개 결과를 모두 반환
- **keyword_weight** (optional, default: 0.3): 하이브리드 검색에서 키워드 가중치
- **semantic_weight** (optional, default: 0.7): 하이브리드 검색에서 의미적 가중치

### 인덱스 업데이트 매개변수
- **post_ids** (optional): 특정 포스트 ID 배열 (지정하지 않으면 모든 공개 포스트)
- **force_rebuild** (optional, default: false): 전체 인덱스 재구축 여부

## 에러 응답 예시

```json
{
    "detail": "ML models not initialized",
    "status_code": 503
}
````

```json
{
    "detail": "Failed to generate embeddings: Model loading error",
    "status_code": 500
}
```

## 기술 스택

-   **FastAPI**: 웹 프레임워크
-   **Sentence Transformers**: 다국어 임베딩 모델
-   **FAISS**: 벡터 유사도 검색
-   **SQLAlchemy**: ORM
-   **PostgreSQL**: 데이터베이스
-   **Redis**: 캐싱 (예정)

## 모델 정보

-   **임베딩 모델**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
-   **임베딩 차원**: 384
-   **기본 동작**: 유사도 임계값 없이 상위 N개 결과 반환 (더 관련성 높은 결과)

## 데이터베이스 연결

기존 TULOG NestJS API와 동일한 PostgreSQL 데이터베이스를 사용합니다.

## 사용 예시

### cURL 예시

**의미 기반 검색:**

```bash
curl -X POST "http://localhost:8001/search/semantic" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "React 성능 최적화",
       "limit": 5
     }'
```

**유사도 필터링이 필요한 경우:**

```bash
curl -X POST "http://localhost:8001/search/semantic" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "React 성능 최적화",
       "limit": 5,
       "similarity_threshold": 0.8
     }'
```

**하이브리드 검색:**

```bash
curl -X POST "http://localhost:8001/search/hybrid" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "Python 머신러닝",
       "limit": 10,
       "keyword_weight": 0.4,
       "semantic_weight": 0.6
     }'
```

**임베딩 생성:**

```bash
curl -X POST "http://localhost:8001/embeddings/generate" \
     -H "Content-Type: application/json" \
     -d '{
       "texts": ["FastAPI는 빠르고 효율적인 Python 웹 프레임워크입니다"]
     }'
```

### Python 클라이언트 예시

```python
import requests

# 의미 기반 검색
response = requests.post(
    "http://localhost:8001/search/semantic",
    json={
        "query": "TypeScript 고급 패턴",
        "limit": 5
    }
)
results = response.json()

# 하이브리드 검색
response = requests.post(
    "http://localhost:8001/search/hybrid",
    json={
        "query": "Django REST API",
        "limit": 10,
        "keyword_weight": 0.3,
        "semantic_weight": 0.7
    }
)
results = response.json()
```

## 개발 참고사항

-   모든 검색은 공개 게시물(`is_public = true`)만 대상으로 합니다
-   삭제된 게시물(`deleted_at IS NOT NULL`)은 검색에서 제외됩니다
-   벡터 인덱스는 자동으로 디스크에 저장되며 서버 재시작 시 복원됩니다
