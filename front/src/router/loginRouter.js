// 로그인/회원가입 라우터
// TODO: 실제 로그인/회원가입 화면 구현 시 이 파일의 placeholder를 교체한다 (Auth Store 구현 이슈)
export default [
  {
    path: '/login',
    name: 'LoginPage',
    component: () => import('@/pages/login/LoginPage.vue'),
  },
  // 아이디 찾기 — 로그인 화면에서 PASS 본인인증 후 가입 이메일(로그인 ID) 조회 (Figma: 아이디찾기)
  // - 비로그인 공개 화면: 기존 회원가입 PASS 인증 구조(useIdentityVerification)를 재사용한다
  {
    path: '/find-id',
    name: 'FindIdPage',
    component: () => import('@/pages/login/FindIdPage.vue'),
  },
  // 비밀번호 재설정 — 로그인 화면의 '비밀번호 찾기'로 진입 (비로그인 공개 화면)
  // 흐름: 아이디 확인(DB 존재 확인) → PASS 본인인증 → 계정 확인(토큰 발급) → 새 비밀번호 입력 → 완료 → /login
  // - 비밀번호 변경 화면에는 5분 유효시간(expiresAt) 카운트다운을 표시한다
  // - 비밀번호 재설정 과정에서 JWT 를 발급/저장하지 않는다 (자동 로그인 없음 — 완료 후 로그인 화면)
  {
    path: '/password-reset',
    name: 'PasswordResetPage',
    component: () => import('@/pages/login/PasswordResetPage.vue'),
  },
  {
    path: '/signup',
    name: 'SignupPage',
    component: () => import('@/pages/signup/SignupPage.vue'),
  },
  // 회원가입 약관 동의 화면 — 약관동의 → 본인인증(/signup/verify) → 계정정보(/signup)
  {
    path: '/signup/terms',
    name: 'TermsAgreementPage',
    component: () => import('@/pages/signup/TermsAgreementPage.vue'),
  },
  // 회원가입 본인인증(PASS) 화면 — 약관동의 후 진입
  {
    path: '/signup/verify',
    name: 'IdentityVerificationPage',
    component: () => import('@/pages/signup/IdentityVerificationPage.vue'),
  },
  // 회원가입 완료 화면 — 계정정보 입력(/signup) 성공 후 진입 (Figma: 회원가입완료)
  {
    path: '/signup/complete',
    name: 'SignupCompletePage',
    component: () => import('@/pages/signup/SignupCompletePage.vue'),
  },
];
