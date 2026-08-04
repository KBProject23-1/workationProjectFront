export default [
  {
    path: '/transaction',
    name: 'TransactionList',
    component: () => import('@/pages/transaction/TransactionList.vue'),
  },
  {
    path: '/transaction/:transactionId',
    name: 'TransactionDetail',
    component: () => import('@/pages/transaction/TransactionDetail.vue'),
  },
];
