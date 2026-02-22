# 04-component-interaction-diagram.md (컴포넌트 상호작용)

이 문서는 서버/클라이언트 컴포넌트 경계를 명확히 정의합니다.

---

## 기본 원칙

- 데이터 조회/정적 출력은 Server Component에서 처리.
- 입력/클릭/낙관적 업데이트는 Client Component에서 처리.
- 클라이언트 상태는 페이지 단위 최소 범위로 격리.

---

## 예시: `/pedia/[id]` 상세 페이지

```text
app/pedia/[id]/page.tsx (Server)
  - fetchArticleById(id)
  - fetchComments(articleId, cursor)
  - children:
    - <ArticleHeader /> (Server)
    - <ArticleBody /> (Server)
    - <CommentSectionClient /> (Client)
        - props: initialComments, articleId, isLoggedIn
        - state: comments[], submitting, error
        - children:
          - <CommentForm /> (Client)
          - <CommentList /> (Client)
              - <CommentItem /> (Client or Server-compatible Presentational)
```

---

## Optimistic UI 상태 전이

- `idle`: 기본 상태
- `submitting`: 임시 댓글 삽입 (`tempId`, `pending=true`)
- `success`: 서버 응답 댓글로 치환
- `error`: 임시 댓글 제거(rollback) + 오류 표시

---

## 인증/권한 관련 컴포넌트 동작

- `Header`는 세션 상태에 따라 로그인/로그아웃 UI 분기.
- `WritePage`는 서버에서 세션 없으면 즉시 리다이렉트.
- `AdminAiPage`는 `role=ADMIN`이 아니면 403 처리.

---

## 렌더링/성능 규칙

- 댓글 목록은 cursor 기반 페이지네이션.
- 긴 본문은 서버에서 markdown -> sanitized HTML로 변환.
- 댓글 작성 성공 후 전체 페이지 리프레시 대신 로컬 상태만 갱신.
