import { TimeSlot, FreeTimeSlot, User, MatchResult } from '@/types';

// 시간을 문자열로 변환 (예: 9.5 -> "09:30")
export const timeToString = (time: number): string => {
  const hours = Math.floor(time);
  const minutes = (time % 1) * 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// 요일을 문자열로 변환
export const dayToString = (day: number): string => {
  const days = ['월', '화', '수', '목', '금'];
  return days[day] || '';
};

// 시간표에서 공강 시간 계산
export const calculateFreeTime = (timetable: TimeSlot[]): FreeTimeSlot[] => {
  const freeSlots: FreeTimeSlot[] = [];
  const dayStart = 9; // 9시부터
  const dayEnd = 18; // 18시까지
  
  for (let day = 0; day < 5; day++) {
    const daySlots = timetable
      .filter(slot => slot.day === day)
      .sort((a, b) => a.startTime - b.startTime);
    
    let currentTime = dayStart;
    
    for (const slot of daySlots) {
      // 현재 시간과 다음 수업 사이에 공강이 있는지 확인
      if (currentTime < slot.startTime) {
        freeSlots.push({
          day,
          startTime: currentTime,
          endTime: slot.startTime
        });
      }
      currentTime = Math.max(currentTime, slot.endTime);
    }
    
    // 마지막 수업 후 공강 시간
    if (currentTime < dayEnd) {
      freeSlots.push({
        day,
        startTime: currentTime,
        endTime: dayEnd
      });
    }
  }
  
  // 최소 1시간 이상의 공강만 반환
  return freeSlots.filter(slot => slot.endTime - slot.startTime >= 1);
};

// 두 사용자의 공통 공강 시간 찾기
export const findCommonFreeTime = (user1: User, user2: User): FreeTimeSlot[] => {
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
            endTime
          });
        }
      }
    }
  }
  
  return commonSlots;
};

// 매칭 점수 계산
export const calculateMatchScore = (currentUser: User, targetUser: User): number => {
  let score = 0;
  
  // 공통 공강 시간 점수 (50점)
  const commonTime = findCommonFreeTime(currentUser, targetUser);
  const totalCommonHours = commonTime.reduce((sum, slot) => sum + (slot.endTime - slot.startTime), 0);
  score += Math.min(totalCommonHours * 10, 50);
  
  // 같은 학과 보너스 (20점)
  if (currentUser.department === targetUser.department) {
    score += 20;
  }
  
  // 같은 학년 보너스 (10점)
  if (currentUser.year === targetUser.year) {
    score += 10;
  }
  
  // 선호 음식 유사도 (20점)
  const commonFoodTypes = currentUser.preferences.foodTypes.filter(
    food => targetUser.preferences.foodTypes.includes(food)
  );
  score += Math.min(commonFoodTypes.length * 5, 20);
  
  return Math.min(score, 100);
};

// 매칭 결과 생성
export const generateMatches = (currentUser: User, allUsers: User[]): MatchResult[] => {
  return allUsers
    .filter(user => user.id !== currentUser.id)
    .map(user => ({
      user,
      commonFreeTime: findCommonFreeTime(currentUser, user),
      matchScore: calculateMatchScore(currentUser, user)
    }))
    .filter(match => match.commonFreeTime.length > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
};

// 샘플 데이터 생성
export const generateSampleUsers = (): User[] => {
  return [
    {
      id: '1',
      name: '김철수',
      department: '컴퓨터공학과',
      year: 3,
      email: 'kim@example.com',
      bio: '맛집 탐방을 좋아합니다!',
      timetable: [
        { day: 0, startTime: 9, endTime: 10.5, subject: '데이터구조', location: '공학관 201' },
        { day: 0, startTime: 13, endTime: 14.5, subject: '알고리즘', location: '공학관 301' },
        { day: 2, startTime: 10, endTime: 11.5, subject: '운영체제', location: '공학관 202' },
        { day: 4, startTime: 14, endTime: 15.5, subject: '네트워크', location: '공학관 401' }
      ],
      preferences: {
        mealTimes: [12, 13, 18],
        locations: ['학생회관', '기숙사 식당'],
        foodTypes: ['한식', '중식', '양식']
      }
    },
    {
      id: '2',
      name: '이영희',
      department: '컴퓨터공학과',
      year: 2,
      email: 'lee@example.com',
      bio: '새로운 사람들과 만나는 것을 좋아해요',
      timetable: [
        { day: 1, startTime: 9, endTime: 10.5, subject: '프로그래밍', location: '공학관 101' },
        { day: 1, startTime: 14, endTime: 15.5, subject: '수학', location: '자연관 201' },
        { day: 3, startTime: 11, endTime: 12.5, subject: '물리학', location: '자연관 301' },
        { day: 4, startTime: 9, endTime: 10.5, subject: '영어', location: '인문관 101' }
      ],
      preferences: {
        mealTimes: [12, 13, 17.5],
        locations: ['학생회관', '카페테리아'],
        foodTypes: ['한식', '일식', '분식']
      }
    },
    {
      id: '3',
      name: '박민수',
      department: '경영학과',
      year: 4,
      email: 'park@example.com',
      bio: '졸업 전에 많은 사람들과 인연을 만들고 싶습니다',
      timetable: [
        { day: 0, startTime: 11, endTime: 12.5, subject: '경영전략', location: '경영관 301' },
        { day: 2, startTime: 9, endTime: 10.5, subject: '마케팅', location: '경영관 201' },
        { day: 2, startTime: 15, endTime: 16.5, subject: '회계학', location: '경영관 401' },
        { day: 4, startTime: 13, endTime: 14.5, subject: '조직행동론', location: '경영관 501' }
      ],
      preferences: {
        mealTimes: [12.5, 18],
        locations: ['학생회관', '외부 식당'],
        foodTypes: ['양식', '일식', '카페']
      }
    }
  ];
};