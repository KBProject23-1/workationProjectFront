import { createRouter, createWebHistory } from 'vue-router';
import accountRouter from './accountRouter';
import accountRouter from './cardRouter';
import workationRouter from './workationRouter';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...accountRouter, ...cardRouter, ...workationRouter],

export default router;
