// 로컬 타임존 기준 YYYY-MM-DD 문자열 변환 (toISOString은 UTC 변환으로 날짜가 하루 밀릴 수 있음)
export function toDateParam(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// BE가 내려주는 "2026-08-05T14:23:00" 형태의 LocalDateTime 문자열을 "2026.08.05 14:23"로 표시.
// new Date()로 파싱하면 타임존 변환이 끼어들 수 있어 문자열 그대로 잘라서 포맷한다
export function formatDateTime(isoString) {
  if (!isoString) return '';
  const [datePart, timePart] = isoString.split('T');
  if (!datePart) return isoString;
  const formattedDate = datePart.replaceAll('-', '.');
  return timePart ? `${formattedDate} ${timePart.slice(0, 5)}` : formattedDate;
}
