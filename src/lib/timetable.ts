import { TimeSlot, FreeTimeSlot, User, MatchResult } from "@/types";

// 시간을 문자열로 변환 (예: 9.5 -> "09:30")
export const timeToString = (time: number): string => {
  const hours = Math.floor(time);
  const minutes = (time % 1) * 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

// 요일을 문자열로 변환
export const dayToString = (day: number): string => {
  const days = ["월", "화", "수", "목", "금"];
  return days[day] || "";
};

// 시간표에서 공강 시간 계산
export const calculateFreeTime = (timetable: TimeSlot[]): FreeTimeSlot[] => {
  const freeSlots: FreeTimeSlot[] = [];
  const dayStart = 9; // 9시부터
  const dayEnd = 18; // 18시까지


  for (let day = 0; day < 5; day++) {
    const daySlots = timetable?
      .filter((slot) => slot.day === day)
      .sort((a, b) => a.startTime - b.startTime) ?? [];

    let currentTime = dayStart;

    for (const slot of daySlots) {
      // 현재 시간과 다음 수업 사이에 공강이 있는지 확인
      if (currentTime < slot.startTime) {
        freeSlots.push({
          day,
          startTime: currentTime,
          endTime: slot.startTime,
        });
      }
      currentTime = Math.max(currentTime, slot.endTime);
    }

    // 마지막 수업 후 공강 시간
    if (currentTime < dayEnd) {
      freeSlots.push({
        day,
        startTime: currentTime,
        endTime: dayEnd,
      });
    }
  }

  // 최소 1시간 이상의 공강만 반환
  return freeSlots.filter((slot) => slot.endTime - slot.startTime >= 1);
};

// 두 사용자의 공통 공강 시간 찾기
export const findCommonFreeTime = (
  user1: User,
  user2: User
): FreeTimeSlot[] => {
  const freeTime1 = calculateFreeTime(user1.timetable);
  const freeTime2 = calculateFreeTime(user2.timetable);

  const commonSlots: FreeTimeSlot[] = [];

  for (const slot1 of freeTime1) {
    for (const slot2 of freeTime2) {
      if (slot1.day === slot2.day) {
        const startTime = Math.max(slot1.startTime, slot2.startTime);
        const endTime = Math.min(slot1.endTime, slot2.endTime);

        // 최소 1시간 이상 겹치는 시간이 있는 경우
        if (endTime - startTime >= 1) {
          commonSlots.push({
            day: slot1.day,
            startTime,
            endTime,
          });
        }
      }
    }
  }

  return commonSlots;
};

// 매칭 점수 계산
export const calculateMatchScore = (
  currentUser: User,
  targetUser: User
): number => {
  let score = 0;

  // 공통 공강 시간 점수 (50점)
  const commonTime = findCommonFreeTime(currentUser, targetUser);
  const totalCommonHours = commonTime.reduce(
    (sum, slot) => sum + (slot.endTime - slot.startTime),
    0
  );
  score += Math.min(totalCommonHours * 10, 50);

  // 같은 학과 보너스 (20점)
  if (currentUser.department === targetUser.department) {
    score += 20;
  }

  // 같은 학년 보너스 (10점)
  if (currentUser.grade === targetUser.grade) {
    score += 10;
  }

  // 선호 음식 유사도 (20점)
  const commonFoodTypes = currentUser.preferences.foodTypes.filter((food) =>
    targetUser.preferences.foodTypes.includes(food)
  );
  score += Math.min(commonFoodTypes.length * 5, 20);

  return Math.min(score, 100);
};

// 매칭 결과 생성
export const generateMatches = (
  currentUser: User,
  allUsers: User[]
): MatchResult[] => {
  return allUsers
    .filter((user) => user.id !== currentUser.id)
    .map((user) => ({
      user,
      commonFreeTime: findCommonFreeTime(currentUser, user),
      matchScore: calculateMatchScore(currentUser, user),
    }))
    .filter((match) => match.commonFreeTime.length > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
};
