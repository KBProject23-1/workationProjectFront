export default [
  {
    path: '/wallet',
    name: 'WalletHome',
    component: () => import('@/pages/wallet/WalletHome.vue'),
  },
  {
    path: '/wallet/accounts',
    name: 'WalletAccountCardList',
    component: () => import('@/pages/wallet/WalletAccountCardList.vue'),
  },
  {
    path: '/wallet/charge',
    name: 'WalletCharge',
    component: () => import('@/pages/wallet/WalletCharge.vue'),
  },
  {
    path: '/wallet/refund',
    name: 'WalletRefund',
    component: () => import('@/pages/wallet/WalletRefund.vue'),
  },
  {
    path: '/wallet/pay',
    name: 'WalletPay',
    component: () => import('@/pages/wallet/WalletPay.vue'),
  },
];
