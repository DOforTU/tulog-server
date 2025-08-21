# TULOG Server Docker 설정 가이드

## 개요

TULOG 서버를 Docker로 실행하기 위한 설정 및 명령어 가이드입니다.

## 생성된 파일들

### 1. Dockerfile (`api/Dockerfile`)

```dockerfile
# Node.js 공식 이미지를 베이스로 사용
FROM node:20-alpine AS base

# 작업 디렉토리 설정
WORKDIR /app

# Package files 복사 및 dependencies 설치
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Development stage
FROM base AS development
RUN npm ci --legacy-peer-deps
COPY . .
EXPOSE 8000
CMD ["npm", "run", "start:dev"]

# Build stage
FROM base AS build
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# 보안을 위한 non-root 유저 생성
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# 필요한 파일들만 복사
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/package*.json ./

# uploads 디렉토리 생성 및 권한 설정
RUN mkdir -p uploads/post-image uploads/team-image uploads/user-profile
RUN chown -R nestjs:nodejs uploads

USER nestjs

EXPOSE 8000

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/api', (res) => { process.exit(res.statusCode === 404 ? 0 : 1) })"

CMD ["node", "dist/src/main.js"]
```

### 2. Docker Compose (`docker-compose.yml`)

```yaml
version: "3.8"

services:
    # PostgreSQL 데이터베이스
    postgres:
        image: postgres:16-alpine
        container_name: tulog-postgres
        env_file:
            - .env.docker
        ports:
            - "${POSTGRES_PORT:-5433}:5432"
        volumes:
            - postgres_data:/var/lib/postgresql/data
            - ./api/dump:/docker-entrypoint-initdb.d
        networks:
            - tulog-network
        healthcheck:
            test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
            interval: 10s
            timeout: 5s
            retries: 5

    # TULOG API 서버
    api:
        build:
            context: ./api
            dockerfile: Dockerfile
            target: production
        container_name: tulog-api
        env_file:
            - api/.env.docker
        environment:
            # 데이터베이스 설정
            DB_HOST: postgres
            DB_PORT: 5432
            # 애플리케이션 설정
            NODE_ENV: development
        ports:
            - "8000:8000"
        volumes:
            - ./api/uploads:/app/uploads
        networks:
            - tulog-network
        depends_on:
            postgres:
                condition: service_healthy
        restart: unless-stopped

networks:
    tulog-network:
        driver: bridge

volumes:
    postgres_data:
```

### 3. Docker 환경변수 파일 (`.env.docker`)

### 4. API 환경변수 파일 (`api/.env.docker`)

기존 `api/.env` 파일을 복사하여 Docker 환경에 맞게 수정:

-   `DB_HOST=host.docker.internal` (로컬 PostgreSQL 사용시)
-   또는 컨테이너 간 통신을 위해 `DB_HOST=postgres`로 오버라이드

### 5. Docker Ignore (`api/.dockerignore`)

불필요한 파일들을 Docker 빌드에서 제외:

```
# TypeScript configuration (주석처리하여 포함)
# tsconfig.json
# tsconfig.build.json
```

### 6. Git Ignore 업데이트 (`.gitignore`)

```
.env.*
```

## 주요 설정 변경사항

### 1. 포트 충돌 해결

-   PostgreSQL: 기본 5432 → 5433 포트로 변경
-   기존 로컬 PostgreSQL과 충돌 방지

### 2. 보안 강화

-   환경변수를 `.env.docker` 파일로 분리
-   Docker Compose에서 하드코딩된 비밀번호 제거

### 3. 빌드 문제 해결

-   npm 의존성 충돌: `--legacy-peer-deps` 플래그 추가
-   빌드 파일 경로: `dist/main.js` → `dist/src/main.js`
-   TypeScript 설정 파일 포함: `.dockerignore`에서 `tsconfig.json` 주석처리

### 4. 데이터베이스 설정

-   `server_api` 스키마 생성
-   TypeORM synchronize 활성화 (`NODE_ENV=development`)

## Docker 명령어

### 기본 실행

```bash
# 컨테이너 빌드 및 백그라운드 실행
docker-compose up --build -d

# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs api
docker-compose logs postgres

# 특정 서비스 재시작
docker-compose restart api
```

### 개발/디버깅

```bash
# 실시간 로그 확인
docker-compose logs -f api

# 최근 로그만 확인
docker-compose logs --tail=20 api

# 컨테이너 내부 접속
docker exec -it tulog-api sh
docker exec -it tulog-postgres psql -U dotu_user_1 -d tulog
```

### 데이터베이스 관리

```bash
# PostgreSQL 스키마 생성
docker exec tulog-postgres psql -U dotu_user_1 -d tulog -c "CREATE SCHEMA IF NOT EXISTS server_api;"

# 테이블 목록 확인
docker exec tulog-postgres psql -U dotu_user_1 -d tulog -c "\dt server_api.*"

# 스키마 목록 확인
docker exec tulog-postgres psql -U dotu_user_1 -d tulog -c "\dn"
```

### 정리/중지

```bash
# 서비스 중지
docker-compose down

# 볼륨까지 삭제 (데이터 완전 삭제)
docker-compose down -v

# 이미지 재빌드 (캐시 무시)
docker-compose build --no-cache
```

## 접속 정보

### 서비스 URL

-   **API 서버**: http://localhost:8000
-   **PostgreSQL**: localhost:5433
-   **API 문서**: http://localhost:8000/api (Swagger UI가 있다면)

### 데이터베이스 연결 정보

```
Host: localhost
Port: 5433
Database: tulog
Username: dotu_user_1
Password: qwer1234@
Schema: server_api
```

## 문제 해결

### 1. 포트 충돌 시

```bash
# 포트 사용 현황 확인
netstat -ano | findstr :5432
netstat -ano | findstr :8000

# 다른 포트 사용 (docker-compose.yml 수정)
ports:
  - "5434:5432"  # PostgreSQL
  - "8001:8000"  # API
```

### 2. 권한 에러 시

```bash
# 볼륨 권한 확인
docker exec tulog-api ls -la /app/uploads

# 권한 수정
docker exec tulog-api chown -R nestjs:nodejs /app/uploads
```

### 3. 빌드 실패 시

```bash
# npm 캐시 클리어 후 재빌드
docker-compose build --no-cache api

# 의존성 문제시 로컬에서 확인
cd api
npm install --legacy-peer-deps
```

### 4. 데이터베이스 연결 실패 시

```bash
# PostgreSQL 상태 확인
docker-compose ps postgres

# 네트워크 연결 확인
docker exec tulog-api ping postgres

# 환경변수 확인
docker exec tulog-api env | grep DB_
```

db 직접 연결

```bash
docker exec -it tulog-postgres psql -U dotu_user_1 -d tulog
```

## 주의사항

1. **환경변수 보안**: `.env.docker` 파일은 git에 커밋하지 않도록 주의
2. **운영 환경**: 실제 운영시에는 더 안전한 비밀번호 사용
3. **포트 관리**: 로컬 서비스와 포트 충돌 방지
4. **데이터 백업**: 볼륨 삭제 전 데이터 백업 필수
5. **개발 모드**: `NODE_ENV=development`로 설정하여 TypeORM synchronize 활성화

## 성공 지표

✅ **컨테이너 상태**: 모든 서비스가 `healthy` 상태  
✅ **API 접속**: http://localhost:8000 응답  
✅ **데이터베이스**: `server_api` 스키마 및 테이블 생성됨  
✅ **Google 로그인**: 500 에러 해결됨
