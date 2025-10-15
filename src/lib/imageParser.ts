import { TimeSlot } from '@/types';

// 시간표 이미지 분석을 위한 유틸리티 함수들
export interface ParsedScheduleData {
  subject: string;
  day: number;
  startTime: number;
  endTime: number;
  location?: string;
  professor?: string;
}

// 요일 매핑
const dayMapping: { [key: string]: number } = {
  '월': 0, '화': 1, '수': 2, '목': 3, '금': 4,
  'MON': 0, 'TUE': 1, 'WED': 2, 'THU': 3, 'FRI': 4,
  'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4
};

// 시간 파싱 함수 (예: "09:00", "9시", "오전 9시" 등)
export function parseTime(timeStr: string): number {
  // 숫자만 추출
  const numbers = timeStr.match(/\d+/g);
  if (!numbers || numbers.length === 0) return 9;
  
  let hour = parseInt(numbers[0]);
  let minute = numbers.length > 1 ? parseInt(numbers[1]) : 0;
  
  // 오후 처리
  if (timeStr.includes('오후') || timeStr.includes('PM')) {
    if (hour !== 12) hour += 12;
  }
  
  return hour + (minute / 60);
}

// 과목명 정리 함수
export function cleanSubjectName(subject: string): string {
  return subject
    .replace(/\([^)]*\)/g, '') // 괄호 제거
    .replace(/\[[^\]]*\]/g, '') // 대괄호 제거
    .replace(/\d{2,}/g, '') // 긴 숫자 제거
    .replace(/[A-Z]{3,}/g, '') // 긴 영문 코드 제거
    .trim();
}

// 강의실 정보 추출
export function extractLocation(text: string): string {
  const locationPatterns = [
    /(\w+관\s*\d+)/g,
    /(\w+동\s*\d+)/g,
    /(\w+\s*\d+호)/g,
    /([A-Z]+\d+)/g
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  
  return '';
}

// 교수명 추출
export function extractProfessor(text: string): string {
  const professorPatterns = [
    /([가-힣]{2,4})\s*교수/g,
    /교수\s*([가-힣]{2,4})/g,
    /([가-힣]{2,4})\s*Prof/g
  ];
  
  for (const pattern of professorPatterns) {
    const match = text.match(pattern);
    if (match) return match[1] || match[0].replace(/교수|Prof/g, '').trim();
  }
  
  return '';
}

// 시간표 텍스트 파싱 (OCR 결과를 시뮬레이션)
export function parseScheduleText(text: string): ParsedScheduleData[] {
  const schedules: ParsedScheduleData[] = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    // 시간표 라인 패턴 매칭
    const patterns = [
      // "컴퓨터공학 월 09:00-10:30 공학관301"
      /([가-힣\w\s]+)\s+([월화수목금])\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})\s*([^\s]*)/g,
      // "웹프로그래밍(월3-4) 공학관201"
      /([가-힣\w]+)\s*\(([월화수목금])(\d+)-(\d+)\)\s*([^\s]*)/g
    ];
    
    for (const pattern of patterns) {
      const matches = [...line.matchAll(pattern)];
      
      for (const match of matches) {
        let subject: string, day: number, startTime: number, endTime: number, location: string;
        
        if (pattern === patterns[0]) {
          // 첫 번째 패턴
          subject = cleanSubjectName(match[1]);
          day = dayMapping[match[2]] ?? 0;
          startTime = parseTime(match[3]);
          endTime = parseTime(match[4]);
          location = extractLocation(match[5] || '');
        } else {
          // 두 번째 패턴 (교시 기반)
          subject = cleanSubjectName(match[1]);
          day = dayMapping[match[2]] ?? 0;
          const startPeriod = parseInt(match[3]);
          const endPeriod = parseInt(match[4]);
          startTime = 9 + (startPeriod - 1) * 1.5; // 1교시 = 9시, 각 교시는 1.5시간
          endTime = 9 + endPeriod * 1.5;
          location = extractLocation(match[5] || '');
        }
        
        if (subject && !isNaN(day) && !isNaN(startTime) && !isNaN(endTime)) {
          schedules.push({
            subject,
            day,
            startTime,
            endTime,
            location,
            professor: extractProfessor(line)
          });
        }
      }
    }
  }
  
  return schedules;
}

// 이미지에서 텍스트 추출 시뮬레이션 (실제로는 OCR API 사용)
export async function extractTextFromImage(file: File): Promise<string> {
  // 실제 구현에서는 Tesseract.js나 Google Vision API 등을 사용
  // 여기서는 샘플 데이터를 반환
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 시뮬레이션된 OCR 결과
      const sampleOcrResult = `
        웹프로그래밍 월 09:00-10:30 공학관301 김교수
        데이터베이스 월 14:00-15:30 공학관201 이교수
        소프트웨어공학 수 11:00-12:30 공학관401 박교수
        네트워크보안 금 13:00-14:30 공학관501 최교수
        알고리즘 화 10:00-11:30 공학관302 정교수
      `;
      resolve(sampleOcrResult);
    }, 2000); // 2초 지연으로 로딩 시뮬레이션
  });
}

// 파싱된 데이터를 TimeSlot 형식으로 변환
export function convertToTimeSlots(parsedData: ParsedScheduleData[]): TimeSlot[] {
  return parsedData.map(data => ({
    day: data.day,
    startTime: data.startTime,
    endTime: data.endTime,
    subject: data.subject,
    location: data.location || '',
    professor: data.professor || ''
  }));
}