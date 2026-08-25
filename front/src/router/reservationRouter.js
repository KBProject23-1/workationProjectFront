export default [
  {
    path: '/reservations/create',
    name: 'ReservationCreate',
    component: () => import('@/pages/reservation/ReservationCreateView.vue'),
  },
  {
    path: '/reservations/:reservationId/complete',
    name: 'ReservationCreateComplete',
    component: () =>
      import('@/pages/reservation/ReservationCreateCompleteView.vue'),
  },
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
    path: '/reservations/:reservationId/cancellation',
    name: 'ReservationCancellationDetail',
    component: () =>
      import('@/pages/reservation/ReservationCancellationDetailView.vue'),
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
