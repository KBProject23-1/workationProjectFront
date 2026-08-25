// PIN 라우터 (jeonggilAhn 파트)
// - PIN 최초 설정. 로그인됐지만 이 기기에 deviceId 가 없으면 전역 가드가 여기로 보낸다(index.js).
export default [
  {
    path: '/pin/setup',
    name: 'PinSetup',
    component: () => import('@/pages/pin/PinSetupPage.vue'),
  },
];
