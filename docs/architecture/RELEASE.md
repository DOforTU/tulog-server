# TULOG 서버 배포 가이드

## 개요

TULOG 서버는 Docker를 활용해 다양한 환경에서 배포할 수 있어. 로컬 개발, 로컬 Docker 테스트, EC2 테스트 서버 등 각 환경별로 설정이 달라서 환경변수 파일을 분리해서 관리하고 있어.

## 환경별 설정 파일

### 1. 로컬 개발 환경
- **API 설정**: `api/.env` (기본 환경변수 파일)
- **용도**: 로컬에서 `npm run start:dev` 실행시 사용
- **데이터베이스**: 로컬 PostgreSQL 연결

### 2. 로컬 Docker 테스트 환경
- **API 설정**: 로컬 도커 테스트용 env 파일
- **Compose 설정**: docker compose용 env 파일  
- **용도**: Docker Compose로 전체 스택 테스트
- **실행 방법**:
  ```bash
  docker-compose --env-file .env.docker up --build
  ```

### 3. EC2 테스트 서버 환경
- **API 설정**: EC2 테스트 서버용 env 파일
- **Compose 설정**: EC2용 docker compose env 파일
- **특징**: 
  - 프론트엔드 배포 없음 (FRONTEND_URL은 localhost 유지)
  - 백엔드 API만 EC2 IP로 설정
  - 강화된 보안 설정 (JWT 시크릿, DB 비밀번호 등)

### 4. 프로덕션 릴리즈 환경 (예정)
- **API 설정**: `api/.env.release` (향후 생성 예정)
- **특징**:
  - 프론트엔드까지 완전 배포
  - 모든 URL이 실제 서버 IP/도메인으로 설정
  - 최고 수준의 보안 설정

## Docker 활용 방법

### 로컬 Docker 테스트

**전체 스택 실행** (PostgreSQL + API 서버):
```bash
# 빌드 및 실행
docker-compose up --build -d

# 로그 확인
docker-compose logs -f api
docker-compose logs postgres

# 정리
docker-compose down
```

**데이터베이스 직접 접속**:
```bash
docker exec -it tulog-postgres psql -U dotu_user_1 -d tulog
```

### EC2 테스트 서버 배포

**방법 1: Docker Compose 사용** (로컬 PostgreSQL):
```bash
# EC2용 env 파일로 실행 (PostgreSQL 컨테이너 포함)
docker-compose -f _docker-compose.yml --env-file .env.ec2 up --build -d
```

**방법 2: RDS 사용** (권장):
```bash
# RDS 전용 compose 파일 사용 (API 서버만)
docker-compose -f docker-compose.rds.yml up --build -d

# 또는 단일 컨테이너 실행
cd api && docker build -t tulog-api .
docker run -d \
  --name tulog-api \
  -p 8000:8000 \
  --env-file .env.ec2 \
  -v ./uploads:/app/uploads \
  --restart unless-stopped \
  tulog-api
```

**RDS 설정 체크리스트**:
1. RDS PostgreSQL 인스턴스 생성 완료
2. `api/.env.ec2`에서 `DB_HOST`를 RDS 엔드포인트로 변경
3. RDS 보안 그룹에서 EC2 IP 허용 (포트 5432)
4. 첫 실행시 `NODE_ENV=development`로 스키마 자동 생성

## 환경별 주요 차이점

### 데이터베이스 연결
- **로컬**: `localhost:5432`
- **로컬 Docker**: 컨테이너 간 통신 (`postgres:5432`)
- **EC2**: 컨테이너 간 통신 또는 RDS 엔드포인트

### 보안 설정
- **로컬**: 개발용 간단한 비밀번호
- **EC2**: 강화된 랜덤 시크릿 키 및 복잡한 비밀번호
- **릴리즈**: 최고 보안 수준

### URL 설정
- **로컬**: 모든 URL이 `localhost`
- **EC2 테스트**: API는 EC2 IP, 프론트는 `localhost` 
- **릴리즈**: 모든 URL이 실제 서버 IP/도메인

## Google OAuth 설정

### 개발 환경
- Callback URL: `http://localhost:8000/api/auth/google/callback`

### EC2 테스트 환경
- Callback URL: `http://EC2_IP:8000/api/auth/google/callback`
- Google Console에서 해당 URL 추가 필요

### 릴리즈 환경 (예정)
- Callback URL: `https://yourdomain.com/api/auth/google/callback`
- HTTPS 적용 및 도메인 연결 필요

## 샘플 데이터

모든 환경에서 샘플 데이터를 사용할 수 있어:
- PostgreSQL 컨테이너 접속 후 `sample/` 폴더의 SQL 파일들을 순서대로 실행
- 사용자, 팀, 포스트, 태그 등 40개 포스트와 24명 사용자 데이터 포함

## 주의사항

1. **환경변수 보안**: 실제 비밀번호와 시크릿 키는 git에 커밋하지 말것
2. **NODE_ENV 설정**: 
   - 첫 배포시: `development` (스키마 자동 생성)
   - 안정화 후: `production` (스키마 변경 금지)
3. **포트 충돌**: 로컬 서비스와 충돌 방지를 위해 PostgreSQL은 5433 포트 사용
4. **데이터 백업**: 볼륨 삭제 전 반드시 데이터 백업

## 향후 개선 계획 (Release 환경 배포 단계)

### 1. RDS 마이그레이션
**목표**: PostgreSQL 컨테이너 → Amazon RDS 전환
- RDS PostgreSQL 인스턴스 생성 (Multi-AZ, 암호화 설정)
- 현재 Docker PostgreSQL 데이터 덤프 및 마이그레이션
- `api/.env.release`에서 DB_HOST를 RDS 엔드포인트로 변경
- 보안 그룹 설정으로 EC2 → RDS 접근 제한
- 자동 백업 및 스냅샷 정책 설정
- Docker Compose에서 PostgreSQL 서비스 제거하여 단일 컨테이너 배포로 전환

### 2. S3 파일 저장소 연동  
**목표**: 로컬 파일 저장 → S3 저장으로 변경
- S3 버킷 생성 및 정책 설정 (퍼블릭 읽기, 제한된 쓰기)
- 환경변수 추가: `AWS_S3_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- 기본 이미지 URL 변경:
  ```env
  USER_DEFAULT_AVATAR_URL=https://bucket.s3.region.amazonaws.com/defaults/user-avatar.png
  TEAM_DEFAULT_IMAGE_URL=https://bucket.s3.region.amazonaws.com/defaults/team-image.png
  DEFAULT_THUMBNAIL_IMAGE_URL=https://bucket.s3.region.amazonaws.com/defaults/post-thumbnail.png
  ```
- 파일 업로드 로직 변경: `file.controller.ts`에서 AWS SDK 사용
- CloudFront CDN 연동으로 이미지 로딩 성능 최적화
- 기존 로컬 업로드 파일들 S3로 마이그레이션

### 3. CI/CD 파이프라인 구축
**목표**: GitHub Actions를 통한 자동 배포
- GitHub Secrets 설정: AWS 자격증명, EC2 SSH 키, 환경변수
- 배포 워크플로우 구성:
  ```
  1. 코드 변경 감지 (main 브랜치 push)
  2. Docker 이미지 빌드 및 ECR 푸시  
  3. EC2 인스턴스 접속하여 새 이미지 배포
  4. 헬스체크 및 롤백 정책
  ```
- 스테이징 → 프로덕션 단계별 배포
- 슬랙/이메일 배포 알림 연동
- 데이터베이스 마이그레이션 자동화

### 4. 모니터링 및 로깅 시스템
**목표**: 프로덕션 환경 안정성 확보
- **로그 수집**: CloudWatch Logs 또는 ELK Stack 구축
- **메트릭 모니터링**: 
  - API 응답시간, 에러율, 처리량
  - 데이터베이스 연결 상태 및 성능
  - 서버 리소스 사용률 (CPU, 메모리, 디스크)
- **알람 설정**: 
  - API 서버 다운시 즉시 알림
  - 에러율 임계값 초과시 알림
  - 데이터베이스 연결 실패시 알림
- **대시보드**: Grafana를 통한 실시간 모니터링 대시보드
- **헬스체크 엔드포인트** 강화: `/health`에서 DB, Redis, 외부 API 연결 상태 체크

### 5. HTTPS 및 도메인 적용
**목표**: 보안 강화 및 사용자 경험 개선
- 도메인 구입 및 DNS 설정 (Route 53 또는 외부 DNS)
- SSL 인증서 발급: Let's Encrypt 또는 AWS Certificate Manager
- **Nginx 리버스 프록시 설정**:
  ```nginx
  server {
      listen 443 ssl;
      server_name yourdomain.com;
      ssl_certificate /path/to/cert.pem;
      ssl_certificate_key /path/to/key.pem;
      
      location /api {
          proxy_pass http://localhost:8000;
          proxy_set_header Host $host;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  ```
- **환경변수 업데이트**:
  ```env
  SERVER_URL=https://yourdomain.com
  FRONTEND_URL=https://yourdomain.com  
  GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
  ```
- **보안 헤더 추가**: HSTS, CSP, X-Frame-Options 등
- **HTTP → HTTPS 리다이렉션 설정**

### 6. 추가 보안 강화 (Release 단계)
- **WAF (Web Application Firewall)** 적용으로 DDoS 및 악성 요청 차단
- **VPC 및 서브넷** 구성으로 네트워크 보안 강화  
- **IAM 역할** 세밀한 권한 설정 (EC2, RDS, S3 접근 제한)
- **시크릿 관리**: AWS Secrets Manager 또는 Parameter Store 활용
- **정기 보안 업데이트** 및 취약점 스캔 자동화
