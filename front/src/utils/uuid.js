// 멱등키 등에 쓰는 UUID 생성.
// crypto.randomUUID 는 보안 컨텍스트(https/localhost)에서만 동작하므로,
// 폰에서 http://<PC-IP> 로 접속하는 등 비보안 컨텍스트를 위한 폴백을 둔다.
export function generateUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
