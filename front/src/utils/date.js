// 로컬 타임존 기준 YYYY-MM-DD 문자열 변환 (toISOString은 UTC 변환으로 날짜가 하루 밀릴 수 있음)
export function toDateParam(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
