export default [
  {
    path: '/card/link',
    name: 'CardLink',
    component: () => import('@/pages/card/CardLink.vue'),
  },
  {
    path: '/card/:cardId/nickname',
    name: 'CardNicknameEdit',
    component: () => import('@/pages/card/CardNicknameEdit.vue'),
  },
];
