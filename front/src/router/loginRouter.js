// 로그인/회원가입 라우터
// TODO: 실제 로그인/회원가입 화면 구현 시 이 파일의 placeholder를 교체한다 (Auth Store 구현 이슈)
export default [
  {
    path: '/login',
    name: 'LoginPage',
    component: () => import('@/pages/login/LoginPage.vue'),
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
