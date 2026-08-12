// 거래 상태(6종) 표시 메타 — 라벨 + 색.
// BE status enum: REQUESTED / AUTHORIZED / PAID / FAILED / CANCELED / REFUNDED
// 색은 흰/옅은 배경 위에서 WCAG AA(4.5:1) 를 만족하도록 조정한 값이다
// (red-500·orange-500·gray-400 은 -50/흰 배경에서 대비 미달이라 한 단계 진하게 사용).
const STATUS_META = {
  REQUESTED: {
    label: '처리중',
    textClass: 'text-gray-500',
    badgeClass: 'text-gray-600 bg-gray-100',
  },
  AUTHORIZED: {
    label: '승인됨',
    textClass: 'text-blue-600',
    badgeClass: 'text-blue-600 bg-blue-50',
  },
  PAID: {
    label: '결제완료',
    textClass: 'text-blue-600',
    badgeClass: 'text-blue-600 bg-blue-50',
  },
  FAILED: {
    label: '실패',
    textClass: 'text-red-600',
    badgeClass: 'text-red-600 bg-red-50',
  },
  CANCELED: {
    label: '승인취소',
    textClass: 'text-red-600',
    badgeClass: 'text-red-600 bg-red-50',
  },
  REFUNDED: {
    label: '환불됨',
    textClass: 'text-orange-700',
    badgeClass: 'text-orange-700 bg-orange-50',
  },
};

const FALLBACK = {
  label: '-',
  textClass: 'text-gray-500',
  badgeClass: 'text-gray-600 bg-gray-100',
};

export function getStatusMeta(status) {
  return STATUS_META[status] ?? { ...FALLBACK, label: status ?? '-' };
}

// 금액이 무효/역거래로 취급되는 상태 (취소선 처리 대상)
const INACTIVE_STATUSES = ['CANCELED', 'REFUNDED', 'FAILED'];

export function isInactiveStatus(status) {
  return INACTIVE_STATUSES.includes(status);
}
