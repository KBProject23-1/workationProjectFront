import { defineStore } from 'pinia';
import {
  getTransactions,
  getTransactionDetail,
  getTransactionReceipt,
  createPayment as createPaymentApi,
  cancelTransaction as cancelTransactionApi,
} from '@/api/transaction';

const PAGE_SIZE = 10;

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    transactions: [],
    currentDetail: null,
    currentReceipt: null,
    filters: {
      startDate: null,
      endDate: null,
      paymentSourceType: null,
      transactionType: null,
      cardId: null,
    },
    page: 0,
    hasMore: true,
    isLoading: false,
    isLoadingMore: false,
    error: null,
  }),

  getters: {
    totalCharge: (state) =>
      state.transactions
        .filter(
          (t) => t.transactionType === 'DEPOSIT' && t.status !== 'CANCELED',
        )
        .reduce((sum, t) => sum + (t.amount ?? 0), 0),

    totalOutflow: (state) =>
      state.transactions
        .filter(
          (t) =>
            (t.transactionType === 'PAYMENT' ||
              t.transactionType === 'WITHDRAWAL') &&
            t.status !== 'CANCELED',
        )
        .reduce((sum, t) => sum + (t.amount ?? 0), 0),

    outflowCount: (state) =>
      state.transactions.filter(
        (t) =>
          (t.transactionType === 'PAYMENT' ||
            t.transactionType === 'WITHDRAWAL') &&
          t.status !== 'CANCELED',
      ).length,
  },

  actions: {
    async fetchTransactions(filters = {}) {
      this.isLoading = true;
      this.error = null;
      this.filters = { ...this.filters, ...filters };
      this.page = 0;
      this.hasMore = true;
      try {
        const { data } = await getTransactions({
          ...this.filters,
          page: 0,
          size: PAGE_SIZE,
        });
        this.transactions = data.content;
        this.hasMore = data.page + 1 < data.totalPages;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchMoreTransactions() {
      if (!this.hasMore || this.isLoadingMore || this.isLoading) return;
      this.isLoadingMore = true;
      try {
        const nextPage = this.page + 1;
        const { data } = await getTransactions({
          ...this.filters,
          page: nextPage,
          size: PAGE_SIZE,
        });
        this.transactions = [...this.transactions, ...data.content];
        this.page = nextPage;
        this.hasMore = data.page + 1 < data.totalPages;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoadingMore = false;
      }
    },

    async fetchTransactionDetail(transactionId) {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getTransactionDetail(transactionId);
        this.currentDetail = data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchTransactionReceipt(transactionId) {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getTransactionReceipt(transactionId);
        this.currentReceipt = data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async createPayment(payload) {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await createPaymentApi(payload);
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async cancelTransaction(transactionId) {
      try {
        const { data } = await cancelTransactionApi(transactionId);
        const target = this.transactions.find(
          (t) => t.transactionId === transactionId,
        );
        if (target) {
          target.status = data.status;
        }
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    resetFilters() {
      this.filters = {
        startDate: null,
        endDate: null,
        paymentSourceType: null,
        transactionType: null,
        cardId: null,
      };
    },
  },
});
