export default [
  {
    path: '/workation',
    name: 'WorkationHome',
    component: () => import('@/pages/workation/WorkationHome.vue'),
  },
  {
    path: '/workation/create',
    name: 'WorkationCreate',
    component: () => import('@/pages/workation/WorkationCreate.vue'),
  },
  {
    path: '/workation/:workationId/budgets',
    name: 'WorkationBudgetSetup',
    component: () => import('@/pages/workation/WorkationBudgetSetup.vue'),
  },
];
