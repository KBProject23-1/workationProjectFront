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
  // 정산을 마친 지난 워케이션 목록.
  // 고정 경로라 :workationId 를 쓰는 라우트들보다 위에 둔다
  {
    path: '/workation/records',
    name: 'SettlementRecordList',
    component: () => import('@/pages/workation/SettlementRecordList.vue'),
  },
  // 지자체 워케이션 지원 제도 안내.
  // 고정 경로라 :workationId 를 쓰는 라우트들보다 위에 둔다
  {
    path: '/workation/regions/:regionId',
    name: 'RegionDetail',
    component: () => import('@/pages/workation/RegionDetail.vue'),
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
    path: '/workation/:workationId/schedules/:scheduleId',
    name: 'ScheduleDetail',
    component: () => import('@/pages/workation/ScheduleDetail.vue'),
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
