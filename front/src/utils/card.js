// 4자리마다 '-'로 끊어서 표시 (maskedNumber는 BE에서 이미 마스킹된 순수 문자열로 옴)
export function formatCardNumber(maskedNumber) {
  if (!maskedNumber) return '';
  return maskedNumber.replace(/(.{4})/g, '$1-').replace(/-$/, '');
}

// 카드사 코드별 고정 그라데이션. 등록 안 된 코드는 해시로 폴백해 항상 같은 카드가 같은 색을 갖게 한다
const GRADIENTS = [
  'linear-gradient(135deg, #334155 0%, #0f172a 100%)',
  'linear-gradient(135deg, #1e40af 0%, #172554 100%)',
  'linear-gradient(135deg, #6d28d9 0%, #312e81 100%)',
  'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)',
  'linear-gradient(135deg, #be123c 0%, #4c0519 100%)',
  'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
  'linear-gradient(135deg, #047857 0%, #064e3b 100%)',
  'linear-gradient(135deg, #4338ca 0%, #1e1b4b 100%)',
];

export function cardGradient(card) {
  const key =
    card.cardCompanyCode || card.cardCompanyName || card.cardName || '';
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) % GRADIENTS.length;
  }
  return GRADIENTS[hash];
}
