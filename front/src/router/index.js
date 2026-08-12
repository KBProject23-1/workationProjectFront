import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
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
    ...merchantRouter,
    ...reservationRouter,
    ...recommendationRouter,
    ...bookmarkRouter,
    ...reviewRouter,
  ],
});

// 로그인 없이는 진입할 수 없는 경로를 막고, 로그인했지만 이 기기에 PIN 이 없으면 PIN 설정으로 보낸다.
//
// 쿠키 기반 인증이라 새로고침하면 인메모리 상태가 사라지므로, 첫 네비게이션에서 GET /users/me 로
// 로그인 상태를 1회 복원(restoreSession)한 뒤 판단한다. restorePromise 로 중복 호출을 막는다.
//
// - 회원가입 플로우(/signup*)는 중간에 auto-login 되므로 게이트에서 완전히 제외한다.
// - 비로그인: 공개(스플래시/온보딩/로그인/아이디 찾기)만 허용, 그 외엔 /login.
// - 로그인 상태에서 스플래시/온보딩/로그인/아이디 찾기 접근 → 서비스 홈(/workation).
// - PIN 게이트: 이 기기 PIN 미등록이면 /pin/setup (설정 페이지 자체는 통과).
let restorePromise = null;

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  // 세션 미확정일 때만 복원 시도. 비확정 실패(네트워크/5xx)면 sessionChecked 가 안 서므로
  // restorePromise 를 비워 다음 네비게이션에서 재시도되게 한다.
  if (!authStore.sessionChecked) {
    if (!restorePromise) restorePromise = authStore.restoreSession();
    await restorePromise;
    restorePromise = null;
  }

  const path = to.path;

  if (path.startsWith('/signup')) return true;

  const isEntry =
    path === '/' ||
    path.startsWith('/onboarding') ||
    path === '/login' ||
    path === '/find-id';

  if (!authStore.isAuthenticated) {
    return isEntry ? true : { path: '/login', query: { redirect: to.fullPath } };
  }

  if (isEntry) return { path: '/workation' };

  if (!path.startsWith('/pin') && !isPinRegistered()) {
    return { path: '/pin/setup', query: { redirect: to.fullPath } };
  }

  return true;
});

export default router;
