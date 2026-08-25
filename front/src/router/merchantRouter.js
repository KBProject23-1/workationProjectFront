export default [
  {
    path: '/reservation/merchants',
    name: 'ReservationMerchantList',
    component: () => import('@/pages/merchant/ReservationMerchantList.vue'),
  },
  {
    path: '/reservation/accommodations/:merchantId',
    name: 'AccommodationDetail',
    component: () => import('@/pages/merchant/AccommodationDetail.vue'),
  },
  {
    path: '/reservation/offices/:merchantId',
    name: 'OfficeDetail',
    component: () => import('@/pages/merchant/OfficeDetail.vue'),
  },
  {
    path: '/merchants/restaurants/:merchantId',
    name: 'RestaurantDetail',
    component: () => import('@/pages/merchant/RestaurantDetail.vue'),
  },
  {
    path: '/merchants/activities/:merchantId',
    name: 'ActivityDetail',
    component: () => import('@/pages/merchant/ActivityDetail.vue'),
  },
  {
    path: '/merchants/:merchantId/reviews',
    name: 'MerchantReviewList',
    component: () => import('@/pages/review/MerchantReviewList.vue'),
  },
];
