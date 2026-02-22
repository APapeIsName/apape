# 05-database-schema.md (데이터베이스 스키마)

Prisma 스키마 기준의 데이터 모델 정의입니다.

---

## 설계 결정

- 권한 관리를 위해 `UserRole`을 둡니다.
- AI 글 허용을 위해 `Article.authorId`는 nullable입니다.
- 세션 인증을 위해 `Session` 테이블을 사용합니다.
- 조회 성능을 위해 목록/댓글 인덱스를 명시합니다.

---

```prisma
enum ArticleType {
  USER
  AI
}

enum UserRole {
  USER
  ADMIN
}

model User {
  id         String    @id @default(cuid())
  email      String    @unique
  name       String?
  password   String
  role       UserRole  @default(USER)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  articles   Article[]
  comments   Comment[]
  sessions   Session[]
}

model Session {
  id           String   @id @default(cuid())
  token        String   @unique
  userId       String
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

model Article {
  id         String      @id @default(cuid())
  title      String
  content    String      @db.Text
  type       ArticleType
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt

  authorId   String?
  author     User?       @relation(fields: [authorId], references: [id], onDelete: SetNull)

  comments   Comment[]

  @@index([type, createdAt(sort: Desc)])
  @@index([authorId, createdAt(sort: Desc)])
}

model Comment {
  id         String   @id @default(cuid())
  content    String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  authorId   String
  articleId  String

  author     User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  article    Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@index([articleId, createdAt(sort: Desc)])
  @@index([authorId, createdAt(sort: Desc)])
}
```

---

## 애플리케이션 레벨 불변 조건

- `Article.type=USER`면 `authorId`는 반드시 존재해야 합니다.
- `Article.type=AI`면 `authorId`는 `null` 허용합니다.
- 댓글 작성은 로그인 사용자만 가능합니다.
