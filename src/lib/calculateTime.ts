export function CalculateTime(decimalTime: number) {
  // 1. 숫자가 유효한지 확인
  if (typeof decimalTime !== "number" || decimalTime < 0) {
    throw new Error("올바른 숫자를 입력하세요.");
  }

  // 2. 시간(정수) 부분과 분(소수점) 부분 분리
  const hours = Math.floor(decimalTime);
  const minutes = (decimalTime - hours) * 60;

  // 3. 분을 가장 가까운 정수로 반올림
  const roundedMinutes = Math.round(minutes);

  // 4. 시와 분을 문자열로 포맷팅
  // 분이 10 미만일 경우 앞에 '0'을 붙여 "05" 형태로 만듭니다.
  const formattedMinutes =
    roundedMinutes < 10 ? `0${roundedMinutes}` : `${roundedMinutes}`;

  return `${hours}:${formattedMinutes}`;
}
