// 스플래시 화면 — 앱 실행 시 가장 먼저 표시되는 화면
export default [
  {
    path: '/',
    name: 'SplashPage',
    component: () => import('@/pages/splash/SplashPage.vue'),
  },
];
