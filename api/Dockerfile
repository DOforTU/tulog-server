# Node.js 18 alpine 이미지 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# TypeScript 빌드
RUN npm run build

# 포트 노출
EXPOSE 8000

# 애플리케이션 실행
CMD ["npm", "run", "start:prod"]

# 현재 api안에 도커파일이랑 서버파일 안에 도커 컴포즈파일을 생성
# 그외 init.sql이랑 ml api/app안에도 도커파일을 생성함
