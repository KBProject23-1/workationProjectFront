import { createRouter, createWebHistory } from 'vue-router';
import accountRouter from './accountRouter';
import cardRouter from './cardRouter';
import walletRouter from './walletRouter';
import workationRouter from './workationRouter';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...accountRouter, ...cardRouter, ...walletRouter, ...workationRouter],
});

export default router;
