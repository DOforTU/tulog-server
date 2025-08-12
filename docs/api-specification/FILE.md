# File Upload API

> ⚠️ 모든 에러 응답은 아래와 같음:  
> `{success: false, statusCode, message (string array), error, timestamp, path}`

---

## File Management

### Upload File

> file/file.controller.ts  
> **`POST /api/files/upload?type={type}`**

-   파일을 서버에 업로드한다.
-   type query parameter로 파일 종류를 지정한다. (user, team, 기타)
-   multipart/form-data로 파일을 전송한다.

-   **Query Parameters**:

    -   `type`: 파일 유형 (user, team, 또는 기타)
        -   `user`: 사용자 프로필 이미지 → `uploads/user-profile/` 폴더에 저장
        -   `team`: 팀 이미지 → `uploads/team-image/` 폴더에 저장
        -   기타: `uploads/others/` 폴더에 저장

-   **Request**: `multipart/form-data`

    -   `file`: 업로드할 파일 (form field name)

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "url": "http://localhost:8000/uploads/user-profile/1754726462282-56153248.jpg"
    },
    "timestamp": "2025-08-09T08:38:01.553Z",
    "path": "/api/files/upload"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 400,
    "message": ["No file uploaded"],
    "error": "BAD_REQUEST",
    "timestamp": "2025-08-09T08:38:01.553Z",
    "path": "/api/files/upload"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   파일이 포함되지 않은 요청 → 400 Bad Request ✅
    -   지원하지 않는 파일 형식 → 400 Bad Request ✅
    -   파일 크기 제한 초과 → 413 Payload Too Large ✅

---

### 사용 예시

#### 사용자 프로필 이미지 업로드

```
POST /api/files/upload?type=user
Content-Type: multipart/form-data

file: [이미지 파일]
```

#### 팀 이미지 업로드

```
POST /api/files/upload?type=team
Content-Type: multipart/form-data

file: [이미지 파일]
```

#### 기타 파일 업로드

```
POST /api/files/upload
Content-Type: multipart/form-data

file: [파일]
```

---

### 파일 저장 구조

-   **사용자 프로필**: `uploads/user-profile/[timestamp]-[random].[ext]`
-   **팀 이미지**: `uploads/team-image/[timestamp]-[random].[ext]`
-   **기타 파일**: `uploads/others/[timestamp]-[random].[ext]`

파일명은 업로드 시간과 랜덤 숫자로 자동 생성되어 중복을 방지합니다.
