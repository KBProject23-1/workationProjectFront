// 1250000 -> 1,250,000원
export const won = (value) => {
  if (value === null || value === undefined) return '0원';
  return Number(value).toLocaleString('ko-KR') + '원';
};

// 2026-07-01 -> 2026.07.01
export const dotDate = (value) => {
  if (!value) return '';
  return value.replaceAll('-', '.');
};
