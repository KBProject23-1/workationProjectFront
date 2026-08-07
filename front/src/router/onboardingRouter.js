// 온보딩 라우터
// TODO: 실제 온보딩 화면 구현 시 이 파일의 placeholder를 교체한다
export default [
  {
    path: '/onboarding',
    name: 'OnboardingPage',
    component: () => import('@/pages/onboarding/OnboardingPage.vue'),
  },
];
