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

export async function loginUser(data) {
  // 실제 환경에서는 비밀번호 해시 비교 로직이 추가되어야 합니다.
  try {
    const userData = await db.user.findUnique({
      where: { email: data.email },
      // 보안을 위해 비밀번호 필드는 제외하고 가져오는 것이 좋습니다.
      select: {
        id: true,
        password: true,
        name: true,
        department: true,
        grade: true,
        email: true,
        bio: true,
        avatar: true,
        preferencesJson: true,
      },
    });

    if (!userData) {
      // 사용자를 찾을 수 없음
      return null;
    }

    // (이 부분에 비밀번호 비교 로직이 들어갑니다. 현재는 생략)

    // 타입이 정확하지 않다면 (예: db.user.findUnique의 결과가 User 타입과 정확히 일치하지 않을 때)
    // 명시적 타입 캐스팅이 필요할 수 있습니다.
    return userData;
  } catch (error) {
    console.error("Login Server Action Error:", error);
    // 실패 시 null 반환 또는 에러 throw
    throw new Error("로그인 처리 중 서버 오류가 발생했습니다.");
  }
}
