import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // Create ADMIN user
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
    },
  });

  // Create regular user
  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      name: "User",
      role: "USER",
    },
  });

  // Create USER articles (by admin)
  const userArticle1 = await prisma.article.create({
    data: {
      title: "Next.js App Router 시작하기",
      content:
        "## 소개\n\nNext.js App Router는 React Server Components를 기반으로 한 새로운 라우팅 시스템입니다.\n\n### 주요 특징\n\n- 서버 컴포넌트 우선\n- 중첩 레이아웃\n- 스트리밍 렌더링\n\n이 글에서는 App Router의 기본 사용법을 알아봅니다.",
      type: "USER",
      authorId: admin.id,
    },
  });

  const userArticle2 = await prisma.article.create({
    data: {
      title: "Prisma ORM으로 데이터베이스 다루기",
      content:
        "## Prisma란?\n\nPrisma는 Node.js와 TypeScript를 위한 차세대 ORM입니다.\n\n### 장점\n\n- 타입 안전한 쿼리\n- 직관적인 스키마 정의\n- 자동 마이그레이션\n\n```prisma\nmodel User {\n  id    String @id @default(cuid())\n  email String @unique\n  name  String?\n}\n```",
      type: "USER",
      authorId: admin.id,
    },
  });

  // Create AI articles (no author)
  const aiArticle1 = await prisma.article.create({
    data: {
      title: "인공지능의 역사와 발전",
      content:
        "## 인공지능의 시작\n\n인공지능(AI)은 1956년 다트머스 회의에서 처음 학문적 분야로 정립되었습니다.\n\n### 주요 이정표\n\n1. **1950년대**: 튜링 테스트 제안\n2. **1997년**: Deep Blue, 체스 세계 챔피언 승리\n3. **2016년**: AlphaGo, 이세돌 9단 승리\n4. **2022년~**: 대규모 언어 모델(LLM) 시대",
      type: "AI",
      authorId: null,
    },
  });

  const aiArticle2 = await prisma.article.create({
    data: {
      title: "양자 컴퓨팅 입문",
      content:
        "## 양자 컴퓨팅이란?\n\n양자 컴퓨팅은 양자역학의 원리를 이용한 새로운 컴퓨팅 패러다임입니다.\n\n### 핵심 개념\n\n- **큐비트(Qubit)**: 0과 1의 중첩 상태\n- **얽힘(Entanglement)**: 큐비트 간의 상관관계\n- **양자 게이트**: 큐비트 상태 변환 연산",
      type: "AI",
      authorId: null,
    },
  });

  // Create comments
  const articles = [userArticle1, userArticle2, aiArticle1, aiArticle2];
  for (const article of articles) {
    await prisma.comment.create({
      data: {
        content: "좋은 글이네요! 감사합니다.",
        authorId: user.id,
        articleId: article.id,
      },
    });
    await prisma.comment.create({
      data: {
        content: "유익한 정보 잘 읽었습니다.",
        authorId: admin.id,
        articleId: article.id,
      },
    });
  }

  console.log("Seed data created successfully!");
  console.log(`  Admin: ${admin.email} (${admin.id})`);
  console.log(`  User:  ${user.email} (${user.id})`);
  console.log(`  Articles: ${articles.length}`);
  console.log(`  Comments: ${articles.length * 2}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
