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
  // 비밀번호 변경 — 현재 비밀번호 확인 후 새 비밀번호로 변경 (PATCH /users/me/password)
  // - docs: 로그인 후 비밀번호 변경 — 변경 성공 후에도 로그인 세션(인증 Cookie) 유지
  {
    path: '/account/me/password',
    name: 'PasswordChangePage',
    component: () => import('@/pages/account/PasswordChangePage.vue'),
  },
  // 계정 설정 — 로그인 사용자 계정 정보 확인 + 휴대폰/이메일/비밀번호 변경·회원 탈퇴 진입
  // - 진입 시 POST /users/me/account/verify 로 현재 비밀번호 재인증 (AccountSettingsPage 내 게이트)
  {
    path: '/account/me/settings',
    name: 'AccountSettingsPage',
    component: () => import('@/pages/account/AccountSettingsPage.vue'),
  },
  // 휴대폰 번호 변경 — 상세 화면은 별도 작업에서 구현 (이번 작업은 route 진입만)
  {
    path: '/account/me/phone',
    name: 'PhoneChangePage',
    component: () => import('@/pages/account/PhoneChangePage.vue'),
  },
  // 이메일 변경 — 상세 화면은 별도 작업에서 구현 (이번 작업은 route 진입만)
  {
    path: '/account/me/email',
    name: 'EmailChangePage',
    component: () => import('@/pages/account/EmailChangePage.vue'),
  },
  // 회원 탈퇴 — 상세 UI 는 별도 작업에서 구현 (이번 작업은 route 진입만)
  {
    path: '/account/me/withdraw',
    name: 'AccountWithdrawPage',
    component: () => import('@/pages/account/AccountWithdrawPage.vue'),
  },
];
