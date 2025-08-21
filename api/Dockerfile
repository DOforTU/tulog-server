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

# Production stage (RDS 최적화)
FROM node:20-alpine AS production

# 시스템 업데이트 및 필수 패키지 설치
RUN apk update && apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# 보안을 위한 non-root 유저 생성
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# 필요한 파일들만 복사 (최적화된 순서)
COPY --from=build --chown=nestjs:nodejs /app/package*.json ./
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist

# uploads 디렉토리 생성 및 권한 설정 (S3 마이그레이션 전까지 임시)
RUN mkdir -p uploads/post-image uploads/team-image uploads/user-profile
RUN chown -R nestjs:nodejs uploads

# 로그 디렉토리 생성
RUN mkdir -p logs && chown -R nestjs:nodejs logs

USER nestjs

EXPOSE 8000

# 개선된 헬스체크 (RDS 연결 고려)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD node -e "require('http').get('http://localhost:8000/api', (res) => { process.exit(res.statusCode === 404 ? 0 : 1) })"

# 신호 처리를 위한 dumb-init 사용
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/main.js"]