# 06-api-endpoints.md (API 엔드포인트 명세)

모든 API는 JSON을 사용하며, 실패 시 공통 에러 포맷을 반환합니다.

---

## 공통 규약

### 인증

- 인증은 `session_token` 쿠키 기반.
- 인증 필요 엔드포인트에서 세션이 없으면 `401 Unauthorized`.
- 권한 부족 시 `403 Forbidden`.

### 공통 에러 포맷

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "title is required",
    "details": {
      "field": "title"
    },
    "requestId": "req_..."
  }
}
```

### 상태 코드

- `200 OK`, `201 Created`, `204 No Content`
- `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`, `429 Too Many Requests`, `500 Internal Server Error`

---

## 1) 인증

### `POST /api/auth/signup`

- body: `{ email, password, name? }`
- success: `201 Created` + `{ user }`
- errors: `409`(중복 이메일), `422`(형식 오류)

### `POST /api/auth/login`

- body: `{ email, password }`
- success: `200 OK` + `{ user }` + 세션 쿠키 설정
- errors: `401`(자격 증명 실패)

### `POST /api/auth/logout`

- success: `204 No Content` + 세션 무효화

### `GET /api/auth/me`

- success: `200 OK` + `{ user: null | userObject }`

---

## 2) 글

### `GET /api/articles?type=USER|AI&cursor=...&limit=20`

- success: `200 OK`

```json
{
  "items": ["..."],
  "nextCursor": "optional"
}
```

### `POST /api/articles`

- auth: 필요
- body: `{ title, content }`
- server behavior: `type=USER`, `authorId=session.userId`
- success: `201 Created` + `{ article }`

### `GET /api/articles/:id`

- success: `200 OK` + `{ article }`
- errors: `404`

### `PATCH /api/articles/:id`

- auth: 필요(작성자 또는 ADMIN)
- body: `{ title?, content? }`
- success: `200 OK` + `{ article }`
- errors: `403`, `404`, `422`

### `DELETE /api/articles/:id`

- auth: 필요(작성자 또는 ADMIN)
- success: `204 No Content`
- errors: `403`, `404`

### `POST /api/admin/ai-articles`

- auth: 필요(ADMIN)
- body: `{ topic }`
- server behavior: 외부 AI 호출 -> `type=AI`, `authorId=null` 저장
- success: `201 Created` + `{ article }`
- errors: `403`, `429`, `502`(외부 AI 실패)

---

## 3) 댓글

### `GET /api/articles/:id/comments?cursor=...&limit=20`

- success: `200 OK` + `{ items, nextCursor }`
- errors: `404`(글 없음)

### `POST /api/articles/:id/comments`

- auth: 필요
- body: `{ content }`
- success: `201 Created` + `{ comment }`
- errors: `401`, `404`, `422`, `429`

### `PATCH /api/comments/:id`

- auth: 필요(작성자 또는 ADMIN)
- body: `{ content }`
- success: `200 OK` + `{ comment }`

### `DELETE /api/comments/:id`

- auth: 필요(작성자 또는 ADMIN)
- success: `204 No Content`

---

## 제한 정책

- 댓글 본문 길이: 1~2000자
- 글 제목 길이: 1~120자
- 글 본문 길이: 1~100000자
- Rate limit: 로그인/회원가입/댓글 작성 엔드포인트 우선 적용
