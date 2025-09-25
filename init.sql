# PostgreSQL 초기화 스크립트
-- server_api 스키마 생성
CREATE SCHEMA IF NOT EXISTS server_api;

-- 기본 권한 설정
GRANT ALL PRIVILEGES ON SCHEMA server_api TO tulog;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA server_api TO tulog;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA server_api TO tulog;