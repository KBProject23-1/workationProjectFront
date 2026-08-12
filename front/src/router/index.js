import { createRouter, createWebHistory } from 'vue-router';
import { hasDeviceId } from '@/utils/device';
import splashRouter from './splashRouter';
import loginRouter from './loginRouter';
import pinRouter from './pinRouter';
import onboardingRouter from './onboardingRouter';
import accountRouter from './accountRouter';
import cardRouter from './cardRouter';
import walletRouter from './walletRouter';
import transactionRouter from './transactionRouter';
import workationRouter from './workationRouter';
import surveyRouter from './surveyRouter';
import devRouter from './devRouter';
import merchantRouter from './merchantRouter';
import reservationRouter from './reservationRouter';
import recommendationRouter from './recommendationRouter';
import bookmarkRouter from './bookmarkRouter';
import reviewRouter from './reviewRouter';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...splashRouter,
    ...loginRouter,
    ...pinRouter,
    ...onboardingRouter,
    ...accountRouter,
    ...cardRouter,
    ...walletRouter,
    ...transactionRouter,
    ...workationRouter,
    ...surveyRouter,
    ...devRouter,
    ...merchantRouter,
    ...reservationRouter,
    ...recommendationRouter,
    ...bookmarkRouter,
    ...reviewRouter,
  ],
});

// deviceId 없이는 결제성 API(충전/환불/결제)가 전부 400 이므로,
// 로그인된 사용자가 이 기기에 PIN(=deviceId)을 등록하지 않았으면 PIN 설정으로 강제 이동한다.
// - 인증 신호는 axiosInstance 와 동일하게 localStorage accessToken 을 사용한다.
//   (실제 쿠키 기반 로그인이 붙으면 이 판별을 함께 손봐야 함)
// - 공개/인증/설정 경로는 무한 리다이렉트 방지를 위해 예외로 둔다.
const DEVICE_EXEMPT_PREFIXES = [
  '/onboarding',
  '/dev-login',
  '/login',
  '/signup',
  '/pin',
];

function isDeviceExempt(path) {
  if (path === '/') return true; // 스플래시
  return DEVICE_EXEMPT_PREFIXES.some((prefix) => path.startsWith(prefix));
}

router.beforeEach((to) => {
  const isAuthed = !!localStorage.getItem('accessToken');
  if (!isAuthed || hasDeviceId() || isDeviceExempt(to.path)) return true;
  return { path: '/pin/setup', query: { redirect: to.fullPath } };
});

export default router;
