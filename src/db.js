// globalThis는 SSR (Server Side Rendering) 환경에서 전역 객체 역할을 합니다.
// Next.js Hot Reloading 때문에 개발 환경에서 PrismaClient가 여러 번 인스턴스화되는 것을 방지합니다.

import { PrismaClient } from "./generated/prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  // 프로덕션 환경에서는 새로운 인스턴스를 사용합니다.
  prisma = new PrismaClient();
} else {
  // 개발 환경에서는 globalThis에 저장된 인스턴스를 재사용합니다.
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient();
  }
  prisma = globalThis.prisma;
}

export default prisma;
