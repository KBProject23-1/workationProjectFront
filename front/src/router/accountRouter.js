export default [
  {
    path: '/account/link',
    name: 'AccountLink',
    component: () => import('@/pages/account/AccountLink.vue'),
  },
  // 내 정보 조회 — 로그인 사용자의 기본 정보(이름/이메일/휴대폰) 확인 + 개인화/설정 메뉴 + 로그아웃 (Figma: 내활동)
  {
    path: '/account/me',
    name: 'MyInfoPage',
    component: () => import('@/pages/account/MyInfoPage.vue'),
  },
  // 프로필 수정 — 닉네임/소속 회사명 수정 (PATCH /users/me) (Figma: 내 프로필 편집)
  {
    path: '/account/me/edit',
    name: 'ProfileEditPage',
    component: () => import('@/pages/account/ProfileEditPage.vue'),
  },
];
