export default [
  {
    path: '/recommendation',
    name: 'RecommendationHome',
    component: () => import('@/pages/recommendation/RecommendationHome.vue'),
  },
  {
    path: '/survey/intro',
    name: 'SurveyIntro',
    component: () => import('@/pages/survey/SurveyIntro.vue'),
  },
  {
    path: '/survey',
    name: 'SurveyForm',
    component: () => import('@/pages/survey/SurveyForm.vue'),
  },
  {
    path: '/survey/result',
    name: 'SurveyResult',
    component: () => import('@/pages/survey/SurveyResult.vue'),
  },
];
