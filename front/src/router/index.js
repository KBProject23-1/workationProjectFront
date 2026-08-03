import { createRouter, createWebHistory } from 'vue-router';
import accountRouter from './accountRouter';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...accountRouter],
});

export default router;
