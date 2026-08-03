import { createRouter, createWebHistory } from 'vue-router';
import accountRouter from './accountRouter';
import cardRouter from './cardRouter';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...accountRouter, ...cardRouter],
});

export default router;
