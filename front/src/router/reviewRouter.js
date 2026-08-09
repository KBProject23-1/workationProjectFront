export default [
  {
    path: '/users/me/reviews',
    name: 'MyReviewList',
    component: () => import('@/pages/review/MyReviewList.vue'),
  },
  {
    path: '/reviews/:reviewId',
    name: 'ReviewDetail',
    component: () => import('@/pages/review/ReviewDetail.vue'),
  },
  {
    path: '/reservations/:reservationId/reviews/new',
    name: 'ReservationReviewCreate',
    component: () => import('@/pages/review/ReviewFormPage.vue'),
    meta: { mode: 'create', sourceType: 'reservation' },
  },
  {
    path: '/transactions/:transactionId/reviews/new',
    name: 'TransactionReviewCreate',
    component: () => import('@/pages/review/ReviewFormPage.vue'),
    meta: { mode: 'create', sourceType: 'transaction' },
  },
  {
    path: '/reviews/:reviewId/edit',
    name: 'ReviewEdit',
    component: () => import('@/pages/review/ReviewFormPage.vue'),
    meta: { mode: 'edit' },
  },
];
