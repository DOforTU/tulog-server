# RDS 설정 및 배포 가이드

## RDS 인스턴스 생성

### 1. AWS RDS 콘솔에서 인스턴스 생성
```
- 엔진: PostgreSQL 16.x
- 템플릿: 프리 티어 또는 프로덕션
- 인스턴스 식별자: tulog-postgres
- 마스터 사용자 이름: dotu_user_1
- 마스터 암호: [강력한 비밀번호 설정]
- 인스턴스 클래스: db.t3.micro (프리티어) 또는 db.t3.small
- 스토리지: 20GB (gp2)
- 다중 AZ: 프로덕션에서는 활성화
```

### 2. 보안 그룹 설정
```
인바운드 규칙:
- 타입: PostgreSQL
- 프로토콜: TCP
- 포트: 5432
- 소스: EC2 인스턴스 보안 그룹 또는 EC2 IP
```

### 3. 파라미터 그룹 (선택사항)
```
- 타임존: Asia/Seoul
- shared_preload_libraries: pg_stat_statements
- log_statement: all (개발 환경에서만)
```

## 환경변수 설정

### api/.env.ec2 업데이트
```env
# Database Configuration (RDS)
DB_HOST=tulog-postgres.xxxxx.ap-northeast-2.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=dotu_user_1
DB_PASSWORD=your_strong_rds_password
DB_DATABASE=tulog
DB_SCHEMA=server_api

# Application Configuration
NODE_ENV=development  # 첫 배포시 스키마 자동 생성용
```

## 배포 방법

### 방법 1: Docker Compose (권장)
```bash
# RDS 전용 compose 파일 사용
docker-compose -f docker-compose.rds.yml up --build -d

# 로그 확인
docker-compose -f docker-compose.rds.yml logs -f api

# 상태 확인
docker-compose -f docker-compose.rds.yml ps
```

### 방법 2: 단일 컨테이너
```bash
# 이미지 빌드
cd api
docker build -t tulog-api .

# 컨테이너 실행
docker run -d \
  --name tulog-api \
  -p 8000:8000 \
  --env-file .env.ec2 \
  -v $PWD/uploads:/app/uploads \
  --restart unless-stopped \
  tulog-api

# 로그 확인
docker logs -f tulog-api
```

## 데이터베이스 초기화

### 스키마 자동 생성 (첫 배포)
```bash
# NODE_ENV=development로 설정하고 서버 시작
# TypeORM이 자동으로 테이블 생성함

# 스키마 생성 확인
docker exec tulog-api node -e "
const { DataSource } = require('typeorm');
// 데이터베이스 연결 테스트 코드
"
```

### 샘플 데이터 삽입
```bash
# RDS에 직접 연결하여 샘플 데이터 삽입
psql -h tulog-postgres.xxxxx.ap-northeast-2.rds.amazonaws.com \
     -U dotu_user_1 \
     -d tulog

# 또는 pgAdmin, DBeaver 등 GUI 도구 사용
```

## 모니터링 및 관리

### 헬스체크
```bash
# API 서버 상태 확인
curl http://your-ec2-ip:8000/api

# 데이터베이스 연결 확인
curl http://your-ec2-ip:8000/api/health
```

### 로그 확인
```bash
# 애플리케이션 로그
docker logs tulog-api --tail=100 -f

# RDS 로그는 AWS 콘솔에서 확인
```

### 백업 및 복원
```bash
# 수동 백업 (개발용)
pg_dump -h tulog-postgres.xxxxx.ap-northeast-2.rds.amazonaws.com \
        -U dotu_user_1 \
        -d tulog > backup.sql

# 복원
psql -h tulog-postgres.xxxxx.ap-northeast-2.rds.amazonaws.com \
     -U dotu_user_1 \
     -d tulog < backup.sql
```

## 프로덕션 전환

### NODE_ENV 변경
```bash
# api/.env.ec2에서 변경
NODE_ENV=production

# 컨테이너 재시작
docker-compose -f docker-compose.rds.yml restart api
```

### 성능 최적화
```
- 연결 풀링 설정
- 인덱스 최적화
- 쿼리 성능 모니터링
- CloudWatch 메트릭 설정
```

## 문제 해결

### 연결 실패
```bash
# 보안 그룹 확인
aws ec2 describe-security-groups --group-ids sg-xxxxx

# 네트워크 연결 테스트
telnet tulog-postgres.xxxxx.ap-northeast-2.rds.amazonaws.com 5432

# DNS 해석 확인
nslookup tulog-postgres.xxxxx.ap-northeast-2.rds.amazonaws.com
```

### 성능 문제
```sql
-- 느린 쿼리 확인
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- 연결 상태 확인
SELECT * FROM pg_stat_activity 
WHERE state = 'active';
```

## 비용 최적화

- **프리 티어**: db.t3.micro, 20GB, 750시간/월 무료
- **스토리지**: gp2 → gp3 전환으로 비용 절약
- **스냅샷**: 자동 백업 보존 기간 최적화
- **다중 AZ**: 개발 환경에서는 비활성화