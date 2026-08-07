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
];
