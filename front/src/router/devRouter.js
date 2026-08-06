// 임시 개발용 라우터 — 실제 로그인 페이지 merge 되면 이 파일과 DevLogin.vue 함께 삭제할 것
export default [
  {
    path: '/dev-login',
    name: 'DevLogin',
    component: () => import('@/pages/dev/DevLogin.vue'),
  },
];
