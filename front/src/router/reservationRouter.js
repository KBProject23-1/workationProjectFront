export default [
  {
    path: '/reservations',
    name: 'ReservationList',
    component: () => import('@/pages/reservation/ReservationListView.vue'),
  },
  {
    path: '/reservations/:reservationId',
    name: 'ReservationDetail',
    component: () => import('@/pages/reservation/ReservationDetailView.vue'),
  },
  {
    path: '/reservations/:reservationId/cancel',
    name: 'ReservationCancelWarning',
    component: () =>
      import('@/pages/reservation/ReservationCancelWarningView.vue'),
  },
  {
    path: '/reservations/:reservationId/cancel/complete',
    name: 'ReservationCancelComplete',
    component: () =>
      import('@/pages/reservation/ReservationCancelCompleteView.vue'),
  },
  {
    path: '/reservations/:reservationId/cancel/fail',
    name: 'ReservationCancelFailure',
    component: () =>
      import('@/pages/reservation/ReservationCancelFailureView.vue'),
  },
];
