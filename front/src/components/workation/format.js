// 1250000 -> 1,250,000원
export const won = (value) => {
  if (value === null || value === undefined) return '0원';
  return Number(value).toLocaleString('ko-KR') + '원';
};

// 좁은 카드에 넣으려고 만원 단위로 줄여 쓴다.
// 95000 -> 9.5만원, 8000 -> 8,000원
export const shortWon = (value) => {
  if (value === null || value === undefined) return '';
  const amount = Number(value);
  if (Number.isNaN(amount)) return '';
  if (amount < 10000) return `${amount.toLocaleString('ko-KR')}원`;

  const man = amount / 10000;
  const text = Number.isInteger(man) ? String(man) : man.toFixed(1);
  return `${text}만원`;
};

// 2026-07-01 -> 2026.07.01
export const dotDate = (value) => {
  if (!value) return '';
  return value.replaceAll('-', '.');
};

// 2026-08-12 -> 8월 12일 (수)
export const dayLabel = (value) => {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  const week = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${week})`;
};

// 12:30:00 -> 12:30
export const hourMinute = (value) => {
  if (!value) return '';
  return value.slice(0, 5);
};

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

// 2026-08-01 -> (토)
export const weekday = (value) => {
  if (!value) return '';
  return WEEK[new Date(`${value}T00:00:00`).getDay()];
};

// 2026-08-01 ~ 2026-08-20 -> 08.01(토)~08.20(목)
export const shortRange = (from, to) => {
  if (!from || !to) return '';
  const trim = (value) =>
    `${value.slice(5).replaceAll('-', '.')}(${weekday(value)})`;
  return `${trim(from)}~${trim(to)}`;
};

// reservation-check 응답의 { room, office } 를 문장으로 풀어 쓴다
// { room: 1, office: 2 } -> 숙박 예약 1건, 공유오피스 예약 2건
export const reservationSummaryText = (summary) => {
  if (!summary) return '';
  const parts = [];
  if (summary.room > 0) parts.push(`숙박 예약 ${summary.room}건`);
  if (summary.office > 0) parts.push(`공유오피스 예약 ${summary.office}건`);
  return parts.join(', ');
};
