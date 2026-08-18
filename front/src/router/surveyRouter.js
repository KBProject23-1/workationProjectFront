// 설문 경로는 두 갈래다.
//
//   1) 등록 흐름  /workation/:workationId/survey?step=create
//      첫 워케이션 등록 2/3 단계. 저장하면 예산 화면으로 이어진다.
//      두 번째 워케이션부터는 기존 응답을 그대로 쓰므로 이 경로를 거치지 않는다.
//
//   2) 조회·수정  /account/me/survey, /account/me/survey/edit
//      내 정보 > 나의 워케이션 스타일. 설문은 사용자의 취향이라
//      진행 중 워케이션이 없어도(등록 전·정산 완료) 보고 고칠 수 있어야 한다.
//
// 경로가 /account 아래인 것은 내 정보의 하위 화면이기 때문이고,
// 화면은 survey 파트라 라우트는 여기서 관리한다.
//
// SurveyIntro 는 등록 흐름에서 쓰지 않아 라우트에서 뺐다.
export default [
  {
    path: '/account/me/survey',
    name: 'SurveyResult',
    component: () => import('@/pages/survey/SurveyResult.vue'),
  },
  {
    path: '/account/me/survey/edit',
    name: 'SurveyEdit',
    component: () => import('@/pages/survey/SurveyForm.vue'),
  },
  {
    path: '/workation/:workationId/survey',
    name: 'SurveyForm',
    component: () => import('@/pages/survey/SurveyForm.vue'),
  },
];
