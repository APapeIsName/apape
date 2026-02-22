# 02-page-structure.md (페이지 구조)

이 문서는 App Router 기준 페이지/라우트 구조를 정의합니다.

---

## 라우트 트리

- `app/`
- `layout.tsx`: 공통 레이아웃(헤더, 푸터, 토스트 컨테이너)
- `page.tsx`: 랜딩 (`/`)
- `blog/`
- `page.tsx`: 사용자 글 목록 (`/blog`)
- `[id]/page.tsx`: 사용자 글 상세 (`/blog/:id`)
- `pedia/`
- `page.tsx`: AI 글 목록 (`/pedia`)
- `[id]/page.tsx`: AI 글 상세 (`/pedia/:id`)
- `write/page.tsx`: 글 작성 (`/write`, 로그인 필요)
- `(auth)/login/page.tsx`: 로그인 (`/login`)
- `(auth)/signup/page.tsx`: 회원가입 (`/signup`)
- `admin/ai/page.tsx`: AI 글 생성 관리 화면 (`/admin/ai`, ADMIN 필요)

---

## API 라우트 파일

- `app/api/auth/signup/route.ts` (`POST`)
- `app/api/auth/login/route.ts` (`POST`)
- `app/api/auth/logout/route.ts` (`POST`)
- `app/api/auth/me/route.ts` (`GET`)

- `app/api/articles/route.ts` (`GET`, `POST`)
- `app/api/articles/[id]/route.ts` (`GET`, `PATCH`, `DELETE`)
- `app/api/articles/[id]/comments/route.ts` (`GET`, `POST`)
- `app/api/comments/[id]/route.ts` (`PATCH`, `DELETE`)

- `app/api/admin/ai-articles/route.ts` (`POST`, ADMIN only)

---

## 보호 경로 및 미들웨어

- `middleware.ts`
- `/write`는 인증 필요.
- `/admin/:path*`는 ADMIN 권한 필요.
- 비인가 접근은 `/login?next=...` 또는 `403` 페이지로 처리.

---

## 명명/ID 정책

- 외부 노출 식별자는 `cuid` 문자열을 사용.
- URL의 `[id]`는 `Article.id`를 그대로 사용.
