import { createRouter, createWebHistory } from 'vue-router';
import splashRouter from './splashRouter';
import loginRouter from './loginRouter';
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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...splashRouter,
    ...loginRouter,
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
  ],
});

export default router;
