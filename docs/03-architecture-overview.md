# 03-architecture-overview.md (아키텍처 개요)

이 문서는 시스템 구성 요소와 데이터 흐름, 보안 경계를 정의합니다.

---

## 1. 기술 스택

- Framework: Next.js (App Router)
- UI: React, Tailwind CSS
- DB: PostgreSQL
- ORM: Prisma
- Auth: DB 세션 + HttpOnly 쿠키 기반 커스텀 인증
- AI: 외부 LLM API (예: Gemini)
- Deploy: Vercel

---

## 2. 핵심 설계 결정

- 기본 렌더링: 서버 컴포넌트 우선
- 상호작용: 필요한 부분만 클라이언트 컴포넌트
- 인증: `session_token` 쿠키를 서버에서 검증
- 권한: `User.role` (`USER`, `ADMIN`)
- AI 글 작성자: `Article.authorId` nullable 허용. AI 글(`type=AI`)은 `authorId=null` 가능.
- 에러 응답: 전 API 공통 에러 포맷 사용

---

## 3. 데이터 흐름

### A. 페이지 첫 로드 (`/blog/:id` 또는 `/pedia/:id`)

1. 브라우저가 페이지 요청.
2. Server Component가 Prisma로 글/댓글 조회.
3. 서버가 HTML 생성 후 응답.
4. 클라이언트는 hydration 후 상호작용 가능 상태 진입.

### B. 댓글 등록 (Optimistic UI)

1. 클라이언트가 임시 댓글을 즉시 렌더링.
2. `POST /api/articles/:id/comments` 호출.
3. API Route에서 세션/입력값/권한 검사 후 DB 저장.
4. 성공 시 임시 댓글을 실제 데이터로 치환.
5. 실패 시 임시 댓글 롤백 + 오류 메시지 표시.

---

## 4. 보안 경계

- 클라이언트 입력은 신뢰하지 않는다.
- API Route에서 Zod 스키마 유효성 검사 수행.
- 비밀번호는 `argon2id` 해시 저장.
- 쿠키는 `HttpOnly`, `Secure`(production), `SameSite=Lax` 적용.
- 마크다운 렌더링 시 HTML sanitize 적용(XSS 방지).

---

## 5. 관측성/운영

- API 응답 헤더에 `x-request-id`를 포함.
- 서버 에러 로그에 `requestId`, `userId`, `route`를 기록.
- 429 대응을 위해 인증 API와 댓글 작성 API에 rate limit 적용.
