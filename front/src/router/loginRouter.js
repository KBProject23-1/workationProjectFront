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
  // 회원가입 약관 동의 화면 — 독립적으로 접근/테스트 가능한 단독 Route
  // 본인인증 등 다음 단계와의 실제 연결은 회원가입 프로세스 통합 작업에서 진행한다.
  {
    path: '/signup/terms',
    name: 'TermsAgreementPage',
    component: () => import('@/pages/signup/TermsAgreementPage.vue'),
  },
];
