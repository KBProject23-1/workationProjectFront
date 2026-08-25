export default [
  {
    path: '/recommendation',
    name: 'RecommendationHome',
    component: () => import('@/pages/recommendation/RecommendationHome.vue'),
  },
  {
    path: '/recommendation/:category(accommodations|offices|restaurants|activities)',
    name: 'RecommendationList',
    component: () => import('@/pages/recommendation/RecommendationList.vue'),
  },
];
