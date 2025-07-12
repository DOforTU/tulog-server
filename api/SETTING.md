# 프로젝트 환경 설정

## 서버 작업 환경 설정

### 1. 작업 디렉토리로 이동

> 도커없이 pull하여 작업하는 경우

```bash
cd server-nestjs
```

### 2. Dependency 설정

package에 있는 라이브러리 자동설치

```
npm i
```

> package에 있는 라이브러리 참고

```
npm i --save @nestjs/swagger swagger-ui-express
npm i --save @nestjs/typeorm typeorm
npm i --save class-validator class-transformer
npm i --save @nestjs/config
```
