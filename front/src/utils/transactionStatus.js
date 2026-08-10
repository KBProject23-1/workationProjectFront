// 거래 상태(6종) 표시 메타 — 라벨 + 색.
// BE status enum: REQUESTED / AUTHORIZED / PAID / FAILED / CANCELED / REFUNDED
const STATUS_META = {
  REQUESTED: {
    label: '처리중',
    textClass: 'text-gray-400',
    badgeClass: 'text-gray-500 bg-gray-100',
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
    textClass: 'text-red-500',
    badgeClass: 'text-red-500 bg-red-50',
  },
  CANCELED: {
    label: '승인취소',
    textClass: 'text-red-500',
    badgeClass: 'text-red-500 bg-red-50',
  },
  REFUNDED: {
    label: '환불됨',
    textClass: 'text-orange-500',
    badgeClass: 'text-orange-500 bg-orange-50',
  },
};

const FALLBACK = {
  label: '-',
  textClass: 'text-gray-400',
  badgeClass: 'text-gray-500 bg-gray-100',
};

export function getStatusMeta(status) {
  return STATUS_META[status] ?? { ...FALLBACK, label: status ?? '-' };
}

// 금액이 무효/역거래로 취급되는 상태 (취소선 처리 대상)
const INACTIVE_STATUSES = ['CANCELED', 'REFUNDED', 'FAILED'];

export function isInactiveStatus(status) {
  return INACTIVE_STATUSES.includes(status);
}
