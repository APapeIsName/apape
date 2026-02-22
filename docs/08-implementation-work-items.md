# 08-implementation-work-items.md (실제 구현 순서 및 작업 항목)

이 문서는 현재 스펙 문서(`01~07`)를 실제 구현으로 옮기기 위한 실행 순서를 정의합니다.
각 단계는 선행조건, 작업 항목, 완료 기준(DoD), 검증 방법을 포함합니다.

---

## 0. 원칙

- 구현 순서는 `DB -> Auth -> API -> UI -> 운영` 고정.
- 각 단계는 완료 기준(DoD) 충족 후 다음 단계로 진행.
- 모든 API는 `06-api-endpoints.md`의 상태코드/에러 포맷을 준수.

---

## 1단계: 프로젝트 골격 및 공통 유틸

### 선행조건

- Next.js App Router 프로젝트 초기화 완료
- 환경변수 파일(`.env`) 사용 가능

### 작업 항목

- 디렉터리 생성
  - `app/api/...`, `lib/...`, `components/...`, `prisma/...`
- 공통 유틸 작성
  - `lib/db.ts` (Prisma singleton)
  - `lib/api-error.ts` (공통 에러 응답 포맷)
  - `lib/request-id.ts` (`x-request-id` 생성/주입)
  - `lib/validators/*` (Zod 스키마)
- 환경변수 키 정의
  - `DATABASE_URL`, `SESSION_SECRET`, `AI_API_KEY`

### 완료 기준 (DoD)

- 서버가 공통 에러 JSON 포맷을 반환할 수 있다.
- API에서 request id를 읽거나 생성할 수 있다.

### 검증

- 샘플 API route 하나에서 성공/실패 응답 형태 확인.

---

## 2단계: 데이터베이스/Prisma 마이그레이션

### 선행조건

- 1단계 완료

### 작업 항목

- `prisma/schema.prisma` 작성 (`05-database-schema.md` 반영)
  - `User`, `Session`, `Article`, `Comment`
  - `UserRole`, `ArticleType`
  - 인덱스 및 `onDelete` 정책 반영
- 마이그레이션 생성/적용
- 시드 데이터 작성
  - 일반 사용자 1명, 관리자 1명
  - 테스트용 USER 글/AI 글/댓글

### 완료 기준 (DoD)

- 마이그레이션이 로컬에서 정상 적용된다.
- `Article.type=AI` + `authorId=null` 케이스가 저장된다.
- 조회 인덱스가 생성되어 있다.

### 검증

- Prisma Studio 또는 SQL로 테이블/인덱스 확인.
- 간단한 create/find 스크립트로 CRUD 동작 확인.

---

## 3단계: 인증/세션/권한 기반 구축

### 선행조건

- 2단계 완료

### 작업 항목

- 인증 로직 구현
  - 비밀번호 해시: `argon2id`
  - 세션 토큰 발급/검증/만료 처리
  - 쿠키 옵션: `HttpOnly`, `Secure(prod)`, `SameSite=Lax`
- 인증 API 구현
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- 권한 유틸 구현
  - `requireAuth`, `requireAdmin`, `requireOwnerOrAdmin`
- `middleware.ts` 구현
  - `/write` 인증 보호
  - `/admin/:path*` ADMIN 보호
  - `next` 리디렉션

### 완료 기준 (DoD)

- 로그인/로그아웃/세션 조회가 정상 동작한다.
- 비로그인 사용자의 보호 페이지 접근이 차단된다.
- ADMIN 아닌 사용자의 `/admin/*` 접근이 차단된다.

### 검증

- 수동 테스트: 401/403/리디렉션 경로 확인.
- API 테스트: 성공/실패 케이스 각각 확인.

---

## 4단계: Articles API 구현

### 선행조건

- 3단계 완료

### 작업 항목

- `GET /api/articles` (type/cursor/limit)
- `POST /api/articles` (USER 글 생성)
- `GET /api/articles/:id`
- `PATCH /api/articles/:id` (작성자 또는 ADMIN)
- `DELETE /api/articles/:id` (작성자 또는 ADMIN)
- `POST /api/admin/ai-articles` (ADMIN + 외부 AI 호출)
- 에러 표준화
  - 401, 403, 404, 422, 429, 502 처리

### 완료 기준 (DoD)

- 모든 endpoint가 스펙 상태코드를 반환한다.
- AI 글 생성 시 `type=AI`, `authorId=null` 저장된다.

### 검증

- API 컬렉션(Postman/Bruno) 기준 엔드포인트별 성공/실패 테스트.

---

## 5단계: Comments API 구현

### 선행조건

- 4단계 완료

### 작업 항목

- `GET /api/articles/:id/comments` (cursor pagination)
- `POST /api/articles/:id/comments` (인증 필요)
- `PATCH /api/comments/:id` (작성자 또는 ADMIN)
- `DELETE /api/comments/:id` (작성자 또는 ADMIN)
- 유효성/제한
  - 댓글 길이 1~2000

### 완료 기준 (DoD)

- 댓글 CRUD가 권한 정책대로 동작한다.
- 존재하지 않는 글/댓글에 대해 404를 반환한다.

### 검증

- 인증/비인증/권한 없음 케이스 포함 API 테스트.

---

## 6단계: 페이지 UI 구현 (읽기/쓰기)

### 선행조건

- 5단계 완료

### 작업 항목

- 페이지 구현
  - `/blog`, `/blog/:id`, `/pedia`, `/pedia/:id`, `/write`, `/login`, `/signup`, `/admin/ai`
- 서버 컴포넌트 중심 데이터 로드
- 마크다운 렌더링 + sanitize 적용
- 공통 토스트/에러 표시 UI

### 완료 기준 (DoD)

- 문서 정의 라우트가 모두 동작한다.
- 비로그인/권한 없음 상태의 UI 분기가 올바르다.

### 검증

- E2E 흐름 테스트(글 작성, AI 글 조회, 로그인/리디렉션).

---

## 7단계: Optimistic UI 및 상호작용 완성

### 선행조건

- 6단계 완료

### 작업 항목

- `CommentSectionClient` 상태 머신 구현
  - `idle`, `submitting`, `success`, `error`
- 임시 댓글 삽입(`tempId`, `pending`) 및 성공 치환
- 실패 시 rollback + 재시도

### 완료 기준 (DoD)

- 댓글 등록 시 새로고침 없이 즉시 반영된다.
- 서버 오류 시 임시 댓글이 제거되고 사용자에게 명확히 안내된다.

### 검증

- 네트워크 실패/401/422/500 시나리오별 동작 확인.

---

## 8단계: 운영 안정화 (Rate Limit/로깅/테스트)

### 선행조건

- 7단계 완료

### 작업 항목

- Rate limit 적용
  - `/api/auth/login`, `/api/auth/signup`, `/api/articles/:id/comments`
- 로깅/추적
  - `requestId`, `userId`, `route`, `status`
- 테스트 작성
  - 단위: validators, auth utils
  - 통합: API route 권한/에러
  - E2E: 핵심 사용자 플로우 2개

### 완료 기준 (DoD)

- 핵심 플로우가 자동화 테스트에서 통과한다.
- 과도 요청 시 429가 안정적으로 반환된다.

### 검증

- 테스트 파이프라인 실행 결과 확인.
- 로컬에서 rate limit 임계치 재현.

---

## 9단계: 배포 준비 및 체크리스트

### 선행조건

- 8단계 완료

### 작업 항목

- 환경변수/시크릿 설정 (Vercel)
- 프로덕션 DB 마이그레이션 절차 정리
- 장애 대응 문서화
  - 외부 AI 장애 시 fallback 메시지
- 최종 릴리즈 노트 작성

### 완료 기준 (DoD)

- 스테이징에서 핵심 플로우 수동 검증 완료.
- 배포 체크리스트 전 항목 완료.

### 검증

- 스테이징 URL에서 사용자 플로우 직접 점검.

---

## 실행 우선순위 요약 (짧은 버전)

1. 공통 유틸/에러 포맷
2. Prisma 스키마/마이그레이션
3. 인증/세션/권한 + middleware
4. Articles API
5. Comments API
6. 페이지 UI
7. Optimistic UI
8. 운영 안정화(테스트/레이트리밋/로깅)
9. 배포

---

## 권장 브랜치 전략

- `feat/db-schema-and-migration`
- `feat/auth-and-session`
- `feat/articles-api`
- `feat/comments-api`
- `feat/pages-and-ui`
- `feat/optimistic-comments`
- `chore/observability-and-tests`

각 브랜치는 단계별 DoD를 만족할 때 머지합니다.
