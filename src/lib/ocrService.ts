import Tesseract from 'tesseract.js';
import { TimeSlot } from '@/types';

// OCR 설정
const OCR_CONFIG = {
  lang: 'kor+eng', // 한국어 + 영어
  options: {
    tessedit_char_whitelist: '0123456789가-힣ㄱ-ㅎㅏ-ㅣABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz()[]- :',
    preserve_interword_spaces: '1',
  }
};

// 요일 매핑
const dayMapping: { [key: string]: number } = {
  '월': 0, '화': 1, '수': 2, '목': 3, '금': 4,
  'MON': 0, 'TUE': 1, 'WED': 2, 'THU': 3, 'FRI': 4,
  'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4
};

// 시간 파싱 함수
function parseTime(timeStr: string): number {
  const cleanTime = timeStr.replace(/[^\d:]/g, '');
  const [hour, minute = '0'] = cleanTime.split(':');
  return parseInt(hour) + parseInt(minute) / 60;
}

// 과목명 정리
function cleanSubjectName(subject: string): string {
  return subject
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\d{3,}/g, '')
    .replace(/[A-Z]{3,}\d*/g, '')
    .trim();
}

// 강의실 추출
function extractLocation(text: string): string {
  const patterns = [
    /(\w+관\s*\d+)/,
    /(\w+동\s*\d+)/,
    /(\w+\s*\d+호)/,
    /([A-Z]+\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return '';
}

// 교수명 추출
function extractProfessor(text: string): string {
  const patterns = [
    /([가-힣]{2,4})\s*교수/,
    /교수\s*([가-힣]{2,4})/,
    /([가-힣]{2,4})\s*Prof/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1] || match[0].replace(/교수|Prof/g, '').trim();
  }
  return '';
}

// 시간표 텍스트 파싱
function parseScheduleText(text: string): TimeSlot[] {
  const schedules: TimeSlot[] = [];
  const lines = text.split('\n').filter(line => line.trim().length > 2);
  
  for (const line of lines) {
    // 다양한 시간표 패턴 매칭
    const patterns = [
      // "컴퓨터공학 월 09:00-10:30 공학관301"
      /([가-힣\w\s]+?)\s+([월화수목금])\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})\s*([^\s]*)/,
      // "웹프로그래밍(월3-4) 공학관201"
      /([가-힣\w]+)\s*\(([월화수목금])(\d+)-(\d+)\)\s*([^\s]*)/,
      // "데이터베이스 월요일 9시-10시30분"
      /([가-힣\w\s]+?)\s+([월화수목금])요일\s+(\d{1,2})시-(\d{1,2})시(\d{0,2})분?/
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        let subject: string, day: number, startTime: number, endTime: number, location: string;
        
        if (pattern === patterns[0]) {
          // 첫 번째 패턴: "과목 요일 시작시간-종료시간 장소"
          subject = cleanSubjectName(match[1]);
          day = dayMapping[match[2]] ?? 0;
          startTime = parseTime(match[3]);
          endTime = parseTime(match[4]);
          location = extractLocation(match[5] || '');
        } else if (pattern === patterns[1]) {
          // 두 번째 패턴: "과목(요일교시-교시) 장소"
          subject = cleanSubjectName(match[1]);
          day = dayMapping[match[2]] ?? 0;
          const startPeriod = parseInt(match[3]);
          const endPeriod = parseInt(match[4]);
          startTime = 9 + (startPeriod - 1) * 1.5;
          endTime = 9 + endPeriod * 1.5;
          location = extractLocation(match[5] || '');
        } else {
          // 세 번째 패턴: "과목 요일 시작시-종료시분"
          subject = cleanSubjectName(match[1]);
          day = dayMapping[match[2]] ?? 0;
          startTime = parseInt(match[3]);
          const endHour = parseInt(match[4]);
          const endMinute = match[5] ? parseInt(match[5]) : 0;
          endTime = endHour + endMinute / 60;
          location = extractLocation(line);
        }
        
        if (subject && subject.length > 1 && !isNaN(day) && !isNaN(startTime) && !isNaN(endTime)) {
          schedules.push({
            subject,
            day,
            startTime,
            endTime,
            location,
            professor: extractProfessor(line)
          });
        }
        break;
      }
    }
  }
  
  return schedules;
}

// 이미지 전처리
function preprocessImage(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // 대비 향상 및 노이즈 제거
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const enhanced = avg > 128 ? 255 : 0; // 이진화
    
    data[i] = enhanced;     // Red
    data[i + 1] = enhanced; // Green
    data[i + 2] = enhanced; // Blue
  }
  
  ctx.putImageData(imageData, 0, 0);
}

// 메인 OCR 함수
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<TimeSlot[]> {
  try {
    // 이미지를 Canvas에 로드
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    const imageLoadPromise = new Promise<void>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        // 이미지 전처리
        preprocessImage(canvas);
        resolve();
      };
      img.onerror = reject;
    });
    
    img.src = URL.createObjectURL(file);
    await imageLoadPromise;
    
    // Tesseract.js로 OCR 수행
    const result = await Tesseract.recognize(
      canvas,
      OCR_CONFIG.lang,
      {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(Math.round(m.progress * 100));
          }
        },
        ...OCR_CONFIG.options
      }
    );
    
    // URL 해제
    URL.revokeObjectURL(img.src);
    
    // 텍스트에서 시간표 정보 추출
    const extractedText = result.data.text;
    console.log('OCR 결과:', extractedText);
    
    const schedules = parseScheduleText(extractedText);
    
    // 중복 제거 및 유효성 검사
    const uniqueSchedules = schedules.filter((schedule, index, self) => 
      index === self.findIndex(s => 
        s.subject === schedule.subject && 
        s.day === schedule.day && 
        s.startTime === schedule.startTime
      )
    );
    
    return uniqueSchedules;
    
  } catch (error) {
    console.error('OCR 처리 중 오류:', error);
    throw new Error('시간표 이미지 분석에 실패했습니다. 이미지가 선명한지 확인해주세요.');
  }
}

// OCR 지원 여부 확인
export function isOCRSupported(): boolean {
  return typeof Worker !== 'undefined' && typeof createImageBitmap !== 'undefined';
}