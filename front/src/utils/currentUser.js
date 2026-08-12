// accessToken(JWT)의 subject 에서 현재 userId 를 추출한다.
// BE JwtTokenProvider 가 setSubject(String.valueOf(userId)) 로 발급하므로 sub === userId.
// 로그인 방식(PASSWORD/PIN/쿠키)과 무관하게 axiosInstance 가 쓰는 localStorage accessToken 만 있으면 된다.
export function getCurrentUserId() {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    // base64url → base64 (+ 패딩 보정)
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    base64 += '='.repeat((4 - (base64.length % 4)) % 4);
    const sub = JSON.parse(atob(base64)).sub;
    const userId = Number(sub);
    return Number.isFinite(userId) ? userId : null;
  } catch {
    return null;
  }
}
