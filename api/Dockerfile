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