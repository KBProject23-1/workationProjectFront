// 반환값:
//   'REENTER'        - PIN 이 틀림(6자리 아님/미스매치). 같은 화면에서 재입력 유도.
//   'LOCKED'         - 5회 초과로 잠김. PASS 재인증 통한 PIN 재설정 필요.
//   'NOT_REGISTERED' - 이 기기에 PIN 미등록(또는 deviceId 누락). PIN 재설정으로 유도.
//   null             - PIN 무관 에러(잔액 부족·한도 등).
export function classifyPinError(err) {
  const code = err?.response?.data?.errorCode || '';
  if (/_PIN_INVALID$/.test(code)) return 'REENTER';
  if (/_PIN_LOCKED$/.test(code)) return 'LOCKED';
  if (/_PIN_NOT_REGISTERED$/.test(code) || /_DEVICE_ID_REQUIRED$/.test(code)) {
    return 'NOT_REGISTERED';
  }
  return null;
}
