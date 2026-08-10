// 설문은 워케이션 등록 2/3 단계라 워케이션 하위 경로에 둔다.
// 워케이션당 1회 응답이므로 workationId 가 경로에 있어야 한다.
//
// SurveyIntro / SurveyResult 는 등록 흐름에서 쓰지 않아 라우트에서 뺐다.
// 파일은 남겨 두었고, 추후 "취향 다시 고르기" 진입점이 생기면 다시 연결한다.
export default [
  {
    path: '/workation/:workationId/survey',
    name: 'SurveyForm',
    component: () => import('@/pages/survey/SurveyForm.vue'),
  },
];
