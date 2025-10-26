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

export async function getUsersExceptUserId(userId) {
  try {
    const users = await db.user.findMany({
      where: { id: { not: userId } },
    });

    return users ?? [];
  } catch (e) {
    console.error("get users:", e);
    throw new Error("사용자들을 가져오는 중 에러 발생");
  }
}

export async function getUserByEmail(email) {
  // 실제 환경에서는 비밀번호 해시 비교 로직이 추가되어야 합니다.
  try {
    const userData = await db.user.findUnique({
      where: { email: email },
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
    console.error("get user by id email:", error);
    // 실패 시 null 반환 또는 에러 throw
    throw new Error("로그인 처리 중 서버 오류가 발생했습니다.");
  }
}

export async function getUserById(id) {
  // 실제 환경에서는 비밀번호 해시 비교 로직이 추가되어야 합니다.
  try {
    const userData = await db.user.findUnique({
      where: { id: id },
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
    console.error("get user by id error:", error);
    // 실패 시 null 반환 또는 에러 throw
    throw new Error("id로 유저를 가져오는 중 서버 오류가 발생했습니다.");
  }
}

export async function getTimetableByUserId(userId) {
  try {
    // 1. TimeSlot 모델에서 쿼리를 실행합니다.
    const userTimetable = await db.timeSlot.findMany({
      where: {
        // 2. 입력받은 userId와 일치하는 레코드만 필터링합니다.
        userId: userId,
      },
      // 필요하다면, TimeSlot과 연결된 User 정보를 포함할 수도 있습니다.
      // include: {
      //   user: true,
      // }
    });

    console.log(
      `Retrieved ${userTimetable.length} time slots for User ID: ${userId}`
    );
    return userTimetable;
  } catch (error) {
    console.error(`Error fetching timetable for user ${userId}:`, error);
    // 오류 발생 시 클라이언트 측에서 처리할 수 있도록 에러를 다시 던집니다.
    throw new Error(`사용자 ID ${userId}의 시간표를 가져오는 데 실패했습니다.`);
  }
}

export async function getMatchRequestsToUserId(userId) {
  try {
    // 1. Prisma의 OR 조건을 사용하여 fromUserId 또는 toUserId가 일치하는 레코드를 모두 조회합니다.
    const matchRequests = await db.matchRequest.findMany({
      where: {
        OR: [
          // { fromUserId: userId }, // 사용자가 보낸 요청
          { toUserId: userId }, // 사용자가 받은 요청
        ],
      },
      // 2. 관계된 사용자 정보를 함께 포함하여 (Eager Loading) N+1 쿼리 문제를 방지합니다.
      include: {
        fromUser: {
          // 요청을 보낸 사용자 정보
          select: {
            id: true,
            name: true,
            department: true,
            grade: true,
            avatar: true,
          },
        },
        toUser: {
          // 요청을 받은 사용자 정보
          select: {
            id: true,
            name: true,
            department: true,
            grade: true,
            avatar: true,
          },
        },
      },
      // 3. (선택 사항) 요청 시간을 기준으로 최신순으로 정렬할 수 있습니다.
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(
      `Retrieved ${matchRequests.length} match requests to User ID: ${userId}`
    );
    return matchRequests;
  } catch (error) {
    console.error(`Error fetching match requests for user ${userId}:`, error);
    throw new Error(
      `사용자 ID ${userId}의 매칭 요청을 가져오는 데 실패했습니다.`
    );
  }
}

export async function getMatchRequestsFromUserId(userId) {
  try {
    // 1. Prisma의 OR 조건을 사용하여 fromUserId 또는 toUserId가 일치하는 레코드를 모두 조회합니다.
    const matchRequests = await db.matchRequest.findMany({
      where: {
        OR: [
          { fromUserId: userId }, // 사용자가 보낸 요청
          // { toUserId: userId }, // 사용자가 받은 요청
        ],
      },
      // 2. 관계된 사용자 정보를 함께 포함하여 (Eager Loading) N+1 쿼리 문제를 방지합니다.
      include: {
        fromUser: {
          // 요청을 보낸 사용자 정보
          select: {
            id: true,
            name: true,
            department: true,
            grade: true,
            avatar: true,
          },
        },
        toUser: {
          // 요청을 받은 사용자 정보
          select: {
            id: true,
            name: true,
            department: true,
            grade: true,
            avatar: true,
          },
        },
      },
      // 3. (선택 사항) 요청 시간을 기준으로 최신순으로 정렬할 수 있습니다.
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(
      `Retrieved ${matchRequests.length} match requests from User ID: ${userId}`
    );
    return matchRequests;
  } catch (error) {
    console.error(`Error fetching match requests for user ${userId}:`, error);
    throw new Error(
      `사용자 ID ${userId}의 매칭 요청을 가져오는 데 실패했습니다.`
    );
  }
}

/**
 * 특정 사용자와 관련된 모든 MatchRequest를 조회합니다.
 * 사용자가 요청을 보냈거나(fromUserId) 받았던(toUserId) 모든 매칭을 반환합니다.
 * * @param {number} userId - 매칭 요청을 조회할 사용자의 ID
 * @returns {Promise<Array<object>>} 관련 MatchRequest 배열
 */
export async function getAllMatchRequestsForUser(userId) {
  // Prisma의 OR 연산자를 사용하여 fromUserId 또는 toUserId가 일치하는 모든 요청을 조회합니다.
  const matches = await db.matchRequest.findMany({
    where: {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
    // 요청과 관련된 사용자 정보를 함께 가져옵니다 (필수: UI 표시용)
    include: {
      fromUser: {
        select: {
          id: true,
          name: true,
          department: true,
          grade: true,
          bio: true,
          avatar: true,
        },
      },
      toUser: {
        select: {
          id: true,
          name: true,
          department: true,
          grade: true,
          bio: true,
          avatar: true,
        },
      },
    },
  });

  return matches;
}

/**
 * 1. timetable을 제외한 사용자 기본 정보를 업데이트합니다.
 * @param {number} userId - 업데이트할 사용자의 ID
 * @param {object} updates - name, bio, preferences 등 timetable을 제외한 일반 필드
 * @returns {Promise<object>} 업데이트된 User 객체
 */
export async function updateUserProfile(userId, updates) {
  // timetable 관계 필드가 updates에 포함되어 있을 경우를 대비하여 명시적으로 제거합니다.
  const { timetable, preferences, ...dataToUpdate } = updates;

  // JSON 문자열로 저장해야 하는 preferences 필드 처리
  if (preferences) {
    dataToUpdate.preferencesJson = JSON.stringify(preferences);
  }

  // Prisma update 호출 (timetable 관계 필드는 data에 포함되지 않으므로 건드리지 않음)
  const updatedUser = await db.user.update({
    where: { id: userId },
    data: { ...dataToUpdate },
  });

  return updatedUser;
}

/**
 * 2. 기존 TimeSlot을 모두 삭제하고, 받은 새 리스트로 덮어씁니다.
 * @param {number} userId - 시간표를 업데이트할 사용자의 ID
 * @param {Array<object>} newTimetable - 새로 덮어쓸 TimeSlot 객체 리스트 (id 필드는 제외)
 * @returns {Promise<object>} 업데이트된 User 객체
 */
export async function setUserTimetable(userId, newTimetable) {
  if (!Array.isArray(newTimetable)) {
    throw new Error("Timetable must be an array.");
  }

  // 1. 새 TimeSlot 생성 데이터를 준비합니다.
  const createData = newTimetable.map((slot) => ({
    // TimeSlot 모델에 직접 연결된 필드만 사용 (userId는 여기서 제외되어야 함)
    subject: slot.subject,
    location: slot.location,
    professor: slot.professor,
    day: slot.day,
    startTime: slot.startTime,
    endTime: slot.endTime,
  }));

  // 2. 트랜잭션을 사용하여 원자적으로 '삭제' 후 '생성' 작업을 실행합니다.
  const result = await db.$transaction([
    // A. 기존 사용자 TimeSlot 레코드 모두 삭제 (Foreign Key 제약 조건 위반 없이 삭제 가능)
    db.timeSlot.deleteMany({
      where: { userId: userId },
    }),

    // B. 새로운 TimeSlot 레코드들을 생성 (userId를 수동으로 연결)
    db.timeSlot.createMany({
      data: createData.map((data) => ({
        ...data,
        userId: userId, // ⭐️ createMany에서는 userId를 수동으로 명시해야 합니다.
      })),
    }),
  ]);

  // 3. 업데이트된 User 객체를 반환합니다. (데이터가 DB에 덮어쓰기 되었으므로 User 객체를 다시 가져옴)
  const updatedUser = await db.user.findUnique({
    where: { id: userId },
    include: { timetable: true }, // 시간표가 포함된 사용자 객체 반환
  });

  return updatedUser;
}
