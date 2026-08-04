import { createRouter, createWebHistory } from 'vue-router';
import accountRouter from './accountRouter';
import cardRouter from './cardRouter';
import walletRouter from './walletRouter';
import transactionRouter from './transactionRouter';
import workationRouter from './workationRouter';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...accountRouter,
    ...cardRouter,
    ...walletRouter,
    ...transactionRouter,
    ...workationRouter,
  ],
});

export default router;
