"use server";
import { toast } from "sonner";
import db from "./db"; // 실제 PrismaClient 인스턴스가 export되는 경로라고 가정

export async function createUser({
  name,
  department,
  grade,
  email,
  password,
  bio,
  avatar,
  preferencesJson,
}) {
  // 경고: 실제 프로덕션 환경에서는 비밀번호를 데이터베이스에 저장하기 전에 반드시
  // bcrypt와 같은 라이브러리를 사용하여 해시(hash) 처리해야 합니다.

  // prisma 클라이언트 인스턴스가 함수 스코프 내에서 사용 가능하다고 가정합니다.
  // 실제 사용 시에는 이 부분을 적절히 처리해야 합니다. (예: 인수로 받기)
  try {
    const newUser = await db.user.create({
      data: {
        name,
        department,
        grade: parseInt(grade), // grade는 스키마에서 Int이므로, 문자열로 들어올 경우 변환
        email,
        password, // 실제로는 해시된 비밀번호를 넣어야 함
        // 선택적 필드는 값이 제공된 경우에만 포함, 아니면 기본값 또는 null (스키마 정의에 따름)
        bio: bio ?? null, // bio가 없으면 null 저장 (String? 이므로)
        avatar: avatar ?? null, // avatar가 없으면 null 저장 (String? 이므로)
        // preferencesJson을 제공하지 않으면 스키마의 @default 값이 자동 적용됩니다.
        preferencesJson: preferencesJson,
      },
      // 생성 후 반환할 필드를 선택할 수 있습니다. (예: 비밀번호 제외)
      select: {
        id: true,
        name: true,
        department: true,
        grade: true,
        email: true,
        bio: true,
        avatar: true,
        preferencesJson: true,
      },
    });

    console.log(`User created successfully with ID: ${newUser.id}`);
    return newUser;
  } catch (error) {
    // 이메일 중복 등의 Prisma 오류를 처리할 수 있습니다.
    console.error("Error creating user:", error);
    throw new Error(`Failed to create user`);
  }
}
