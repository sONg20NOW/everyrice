import db from "@/db"; // 실제 PrismaClient 인스턴스가 export되는 경로라고 가정
import { MatchStatus, MatchType } from "../../generated/prisma/client";
import { AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

// NOTE: JSON 필드에 삽입할 때 사용되는 데이터 구조입니다.
// TypeScript 인터페이스는 제거되었지만, 데이터 구조는 유지됩니다.

/**
 * Server Component: /seed 경로에 접속하면 이 컴포넌트가 서버에서 렌더링됩니다.
 * 이 페이지는 데이터베이스 시딩을 처리합니다.
 */
export default async function SeedPage() {
  // 프로덕션 환경에서는 시딩을 제한합니다.
  if (process.env.NODE_ENV === "production") {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Access Denied</h1>
        <p>This page is not available in the production environment.</p>
      </div>
    );
  }

  try {
    console.log("Start database seeding...");

    // 1. 기존 데이터 정리 (관계형 종속성에 따라 역순으로 삭제)
    await db.matchResult.deleteMany();
    await db.matchRequest.deleteMany();
    await db.timeSlot.deleteMany();
    await db.user.deleteMany();
    console.log("Database cleared (Users, TimeSlots, Matches).");

    // 2. 사용자 데이터 삽입 (JSON 필드 처리)

    const user1Preferences = {
      mealTimes: [12, 18],
      locations: ["학생회관", "카페테리아"],
      foodTypes: ["한식", "피자"],
    };
    const user2Preferences = {
      mealTimes: [13, 18.5],
      locations: ["외부 식당", "기숙사 식당"],
      foodTypes: ["양식", "카페"],
    };

    const user1 = await db.user.create({
      data: {
        name: "김철수",
        department: "컴퓨터공학과",
        grade: 3,
        email: "chulsu.kim@everyrice.com",
        bio: "새로운 팀원을 찾고 있어요. 점심은 무조건 한식!",
        preferencesJson: JSON.stringify(user1Preferences),
      },
    });

    const user2 = await db.user.create({
      data: {
        name: "이영희",
        department: "경영학과",
        grade: 4,
        email: "younghee.lee@everyrice.com",
        bio: "졸업반, 점심시간 유동적입니다.",
        preferencesJson: JSON.stringify(user2Preferences),
      },
    });
    console.log(`Created users: ${user1.name}, ${user2.name}`);

    // 3. 시간표 (TimeSlot) 데이터 삽입

    // 김철수(user1)의 수업
    const chulsuTimeSlots = [
      {
        subject: "알고리즘",
        day: 0,
        startTime: 9,
        endTime: 10.5,
        location: "공학관 301호",
        professor: "박교수",
      }, // 월 9:00 - 10:30
      { subject: "데이터베이스", day: 2, startTime: 14, endTime: 15.5 }, // 수 14:00 - 15:30
    ];

    for (const slot of chulsuTimeSlots) {
      await db.timeSlot.create({
        data: {
          ...slot,
          userId: user1.id,
        },
      });
    }

    // 이영희(user2)의 수업
    const youngheeTimeSlots = [
      {
        subject: "경영전략",
        day: 1,
        startTime: 10.5,
        endTime: 12,
        location: "경영관 401호",
        professor: "김교수",
      }, // 화 10:30 - 12:00
      { subject: "재무회계", day: 3, startTime: 13, endTime: 14.5 }, // 목 13:00 - 14:30
    ];

    for (const slot of youngheeTimeSlots) {
      await db.timeSlot.create({
        data: {
          ...slot,
          userId: user2.id,
        },
      });
    }
    console.log("TimeSlots seeded.");

    // 4. 매칭 요청 (MatchRequest) 데이터 삽입
    const proposedTime = { day: 2, startTime: 12, endTime: 13 }; // 수요일 12:00 ~ 13:00

    await db.matchRequest.create({
      data: {
        fromUserId: user1.id,
        toUserId: user2.id,
        proposedTimeJson: JSON.stringify(proposedTime), // JSON 직렬화
        message: "수요일 점심 같이 드실래요? 학생회관 근처 괜찮습니다!",
        status: MatchStatus.PENDING,
        type: MatchType.BIDIRECTIONAL,
      },
    });
    console.log("MatchRequest seeded.");

    // 5. 매칭 결과 (MatchResult) 데이터 삽입
    const commonFreeTimes = [
      { day: 2, startTime: 12, endTime: 14 },
      { day: 4, startTime: 15, endTime: 18 },
    ];

    await db.matchResult.create({
      data: {
        userId: user1.id, // 김철수가 본 매칭 결과
        matchScore: 85.5,
        commonFreeTimeJson: JSON.stringify(commonFreeTimes), // JSON 직렬화
      },
    });
    console.log("MatchResult seeded.");

    // 시딩 성공 시 메시지 표시
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl">
          <div className="flex items-center space-x-4 p-4 rounded-lg bg-green-100 text-green-800 border-l-4 border-green-500">
            <CheckCircle className="w-6 h-6" />
            <h1 className="text-xl font-semibold">데이터베이스 시딩 성공!</h1>
          </div>
          <div className="mt-6 space-y-4">
            <p className="text-gray-700">
              모든 기존 데이터가 삭제되고 새로운 시드 항목이 추가되었습니다.
            </p>
            <Link href="/" className="text-red-500 hover:underline block pt-2">
              홈으로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Seeding Error:", error);

    // 시딩 실패 시 에러 메시지 표시
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl">
          <div className="flex items-center space-x-4 p-4 rounded-lg bg-red-100 text-red-800 border-l-4 border-red-500">
            <AlertCircle className="w-6 h-6" />
            <h1 className="text-xl font-semibold">시딩 실패</h1>
          </div>
          <div className="mt-6 space-y-4 text-sm text-gray-700">
            <p>데이터베이스 시딩 중 오류가 발생했습니다. 콘솔을 확인하세요.</p>
            <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-xs">
              {error instanceof Error ? error.message : "알 수 없는 오류 발생"}
            </pre>
            <p className="text-xs text-gray-500">
              DB 연결, 마이그레이션 상태(npx prisma migrate status), 그리고
              스키마 정의를 확인해 주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
