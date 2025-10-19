// 시간표 관련 타입
export interface TimeSlot extends FreeTimeSlot {
  id: number;
  subject: string; // 과목명
  location?: string; // 강의실
  professor?: string; // 교수명
}

export interface User {
  id: string;
  name: string;
  department: string;
  grade: number;
  email: string;
  bio?: string;
  avatar?: string;
  timetable: TimeSlot[];
  preferences: {
    mealTimes: number[]; // 선호하는 식사 시간대
    locations: string[]; // 선호하는 식당 위치
    foodTypes: string[]; // 선호하는 음식 종류
  };
}

export interface MatchRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  proposedTime: {
    day: number;
    startTime: number;
    endTime: number;
  };
  message?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  type: "bidirectional" | "unidirectional"; // 양방향/단방향
}

export interface FreeTimeSlot {
  day: number;
  startTime: number;
  endTime: number;
}

// 매칭 결과
export interface MatchResult {
  user: User;
  commonFreeTime: FreeTimeSlot[];
  matchScore: number; // 매칭 점수 (0-100)
}
