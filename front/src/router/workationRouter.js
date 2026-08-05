export default [
  {
    path: '/workation',
    name: 'WorkationHome',
    component: () => import('@/pages/workation/WorkationHome.vue'),
  },
  {
    path: '/workation/create',
    name: 'WorkationCreate',
    component: () => import('@/pages/workation/WorkationForm.vue'),
  },
  {
    path: '/workation/:workationId/edit',
    name: 'WorkationEdit',
    component: () => import('@/pages/workation/WorkationForm.vue'),
  },
  {
    path: '/workation/:workationId/budgets',
    name: 'WorkationBudgetSetup',
    component: () => import('@/pages/workation/WorkationBudgetSetup.vue'),
  },
  {
    path: '/workation/:workationId/settlement',
    name: 'SettlementView',
    component: () => import('@/pages/workation/SettlementView.vue'),
  },
  {
    path: '/workation/:workationId/settlement/complete',
    name: 'SettlementComplete',
    component: () => import('@/pages/workation/SettlementComplete.vue'),
  },
  {
    path: '/workation/:workationId/expenses',
    name: 'ExpenseList',
    component: () => import('@/pages/workation/ExpenseList.vue'),
  },
  {
    path: '/workation/:workationId/expenses/new',
    name: 'ExpenseCreate',
    component: () => import('@/pages/workation/ExpenseForm.vue'),
  },
  {
    path: '/workation/:workationId/expenses/:expenseId',
    name: 'ExpenseDetail',
    component: () => import('@/pages/workation/ExpenseDetail.vue'),
  },
  {
    path: '/workation/:workationId/expenses/:expenseId/edit',
    name: 'ExpenseEdit',
    component: () => import('@/pages/workation/ExpenseForm.vue'),
  },
];
