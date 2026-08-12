import { createRouter, createWebHistory } from 'vue-router';
import { getCurrentUserId } from '@/utils/currentUser';
import { isPinRegistered } from '@/utils/pinRegistry';
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

// 결제성 API(충전/환불/결제)는 서버가 PIN(=user_device 등록)을 요구하므로,
// 로그인된 사용자가 "이 기기에 자기 PIN 을 등록하지 않았으면" PIN 설정으로 강제 이동한다.
// - PIN 등록은 (userId, deviceId)별 사실이라 유저 단위로 판단한다.
//   현재 userId 는 accessToken(JWT sub)에서 얻고, 등록 여부는 pinRegistry 캐시로 본다.
//   (캐시는 로그인 응답 pinSetupRequired 로 seed, 거래 응답으로 동기화 — 서버가 진실)
// - userId 를 못 읽으면 판단 불가 → 통과(거래 시 NOT_REGISTERED 로 fail-safe).
// - 공개/인증/설정 경로는 무한 리다이렉트 방지를 위해 예외로 둔다.
const PIN_EXEMPT_PREFIXES = [
  '/onboarding',
  '/dev-login',
  '/login',
  '/signup',
  '/pin',
];

function isPinExempt(path) {
  if (path === '/') return true;
  return PIN_EXEMPT_PREFIXES.some((prefix) => path.startsWith(prefix));
}

router.beforeEach((to) => {
  const isAuthed = !!localStorage.getItem('accessToken');
  if (!isAuthed || isPinExempt(to.path)) return true;
  const userId = getCurrentUserId();
  if (userId == null || isPinRegistered(userId)) return true;
  return { path: '/pin/setup', query: { redirect: to.fullPath } };
});

export default router;
