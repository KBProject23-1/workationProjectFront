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

const DEVICE_EXEMPT_PREFIXES = [
  '/onboarding',
  '/dev-login',
  '/login',
  '/signup',
  '/pin',
];

function isDeviceExempt(path) {
  if (path === '/') return true;
  return DEVICE_EXEMPT_PREFIXES.some((prefix) => path.startsWith(prefix));
}

router.beforeEach((to) => {
  const isAuthed = !!localStorage.getItem('accessToken');
  if (!isAuthed || hasDeviceId() || isDeviceExempt(to.path)) return true;
  return { path: '/pin/setup', query: { redirect: to.fullPath } };
});

export default router;
