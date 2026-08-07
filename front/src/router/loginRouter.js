// 로그인 라우터
// TODO: 실제 로그인 화면 구현 시 이 파일의 placeholder를 교체한다 (Auth Store 구현 이슈)
export default [
  {
    path: '/login',
    name: 'LoginPage',
    component: () => import('@/pages/login/LoginPage.vue'),
  },
];
