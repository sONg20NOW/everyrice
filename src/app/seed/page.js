import db from "@/db"; // 실제 PrismaClient 인스턴스가 export되는 경로라고 가정
import { MatchStatus } from "../../generated/prisma/client";
import { AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

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
    await db.matchRequest.deleteMany();
    await db.timeSlot.deleteMany();
    await db.user.deleteMany();
    console.log("Database cleared (Users, TimeSlots, Matches).");

    // 2. 사용자 데이터 삽입 (JSON 필드 처리)

    // 기존 사용자 선호도
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
    // ⭐️ 추가 사용자 선호도
    const user3Preferences = {
      mealTimes: [12.5, 19],
      locations: ["제2식당", "푸드코트"],
      foodTypes: ["중식", "일식"],
    };
    const user4Preferences = {
      mealTimes: [11.5, 17],
      locations: ["연구동", "학생회관"],
      foodTypes: ["비건", "샐러드"],
    };

    const user1 = await db.user.create({
      data: {
        name: "김철수",
        department: "컴퓨터공학과",
        grade: 3,
        email: "chulsu.kim@everyrice.com",
        password: "12345678",
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
        password: "12345678",
        bio: "졸업반, 점심시간 유동적입니다.",
        preferencesJson: JSON.stringify(user2Preferences),
      },
    });

    // ⭐️ 추가 사용자 삽입
    const user3 = await db.user.create({
      data: {
        name: "박민준",
        department: "수학과",
        grade: 2,
        email: "minjun.park@everyrice.com",
        password: "12345678",
        bio: "같이 저녁 먹을 사람 구해요. 주로 중식 선호합니다.",
        preferencesJson: JSON.stringify(user3Preferences),
      },
    });

    const user4 = await db.user.create({
      data: {
        name: "최지우",
        department: "생명과학과",
        grade: 1,
        email: "jiwoo.choi@everyrice.com",
        password: "12345678",
        bio: "건강식 선호! 학관 근처에서 밥 먹어요.",
        preferencesJson: JSON.stringify(user4Preferences),
      },
    });

    console.log(
      `Created users: ${user1.name}, ${user2.name}, ${user3.name}, ${user4.name}`
    );

    // 3. 시간표 (TimeSlot) 데이터 삽입

    // 김철수(user1)의 수업 (기존)
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

    // 이영희(user2)의 수업 (기존)
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

    // ⭐️ 박민준(user3)의 수업 추가
    const minjunTimeSlots = [
      { subject: "미분적분학", day: 0, startTime: 15, endTime: 16.5 }, // 월 15:00 - 16:30
      { subject: "선형대수학", day: 4, startTime: 11, endTime: 12.5 }, // 금 11:00 - 12:30
    ];

    for (const slot of minjunTimeSlots) {
      await db.timeSlot.create({
        data: {
          ...slot,
          userId: user3.id,
        },
      });
    }

    // ⭐️ 최지우(user4)의 수업 추가
    const jiwooTimeSlots = [
      { subject: "일반생물학", day: 1, startTime: 9, endTime: 10.5 }, // 화 9:00 - 10:30
      { subject: "유기화학", day: 3, startTime: 17, endTime: 18.5 }, // 목 17:00 - 18:30
    ];

    for (const slot of jiwooTimeSlots) {
      await db.timeSlot.create({
        data: {
          ...slot,
          userId: user4.id,
        },
      });
    }
    console.log("TimeSlots seeded (Total 8).");

    // 4. 매칭 요청 (MatchRequest) 데이터 삽입

    // 김철수(user1) -> 이영희(user2) 요청 (기존)
    const proposedTime1 = { day: 2, startTime: 12, endTime: 13 }; // 수요일 12:00 ~ 13:00 (점심)
    await db.matchRequest.create({
      data: {
        fromUserId: user1.id,
        toUserId: user2.id,
        proposedTimeJson: JSON.stringify(proposedTime1), // JSON 직렬화
        message: "수요일 점심 같이 드실래요? 학생회관 근처 괜찮습니다!",
        status: MatchStatus.PENDING,
      },
    });

    // ⭐️ 박민준(user3) -> 최지우(user4) 요청 (수락됨)
    const proposedTime2 = { day: 4, startTime: 13, endTime: 14 }; // 금요일 13:00 ~ 14:00 (점심)
    await db.matchRequest.create({
      data: {
        fromUserId: user3.id,
        toUserId: user4.id,
        proposedTimeJson: JSON.stringify(proposedTime2),
        message: "금요일 점심, 간단하게 푸드코트에서 샐러드 어떠신가요?",
        status: MatchStatus.ACCEPTED, // 수락된 요청 시뮬레이션
      },
    });

    // ⭐️ 이영희(user2) -> 박민준(user3) 요청 (거절됨)
    const proposedTime3 = { day: 1, startTime: 18.5, endTime: 19.5 }; // 화요일 18:30 ~ 19:30 (저녁)
    await db.matchRequest.create({
      data: {
        fromUserId: user2.id,
        toUserId: user3.id,
        proposedTimeJson: JSON.stringify(proposedTime3),
        message: "화요일 저녁에 외부 식당에서 밥 먹어요! 제가 살게요.",
        status: MatchStatus.REJECTED, // 거절된 요청 시뮬레이션
      },
    });

    console.log("MatchRequest seeded (Total 3).");

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
              <br />
              **총 4명의 사용자, 8개의 시간표, 3개의 매칭 요청**이
              삽입되었습니다.
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
