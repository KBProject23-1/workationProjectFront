import { defineStore } from 'pinia';
import {
  getTransactions,
  getTransactionSummary,
  getTransactionDetail,
  getTransactionReceipt,
  createPayment as createPaymentApi,
} from '@/api/transaction';
import { toDateParam } from '@/utils/date';

const PAGE_SIZE = 10;

function getDefaultDateRange() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 30);
  return {
    startDate: toDateParam(start),
    endDate: toDateParam(now),
  };
}

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    transactions: [],
    currentDetail: null,
    currentReceipt: null,
    filters: {
      ...getDefaultDateRange(),
      paymentSourceType: null,
      transactionType: null,
      cardId: null,
    },
    page: 0,
    hasMore: true,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    returnedFromDetail: false,
    totalCharge: 0,
    totalOutflow: 0,
    outflowCount: 0,
  }),

  actions: {
    async fetchTransactions(filters = {}) {
      this.isLoading = true;
      this.error = null;
      this.filters = { ...this.filters, ...filters };
      this.page = 0;
      this.hasMore = true;
      this.fetchSummary();
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

    // 필터 조건 전체 기준 합계. 페이징과 무관하게 항상 정확한 값을 보여주기 위해 목록과 별도로 조회한다
    async fetchSummary() {
      try {
        const { data } = await getTransactionSummary({
          startDate: this.filters.startDate,
          endDate: this.filters.endDate,
          paymentSourceType: this.filters.paymentSourceType,
          cardId: this.filters.cardId,
        });
        this.totalCharge = data.totalChargeAmount;
        this.totalOutflow = data.totalPaymentAmount;
        this.outflowCount = data.totalPaymentCount;
      } catch (err) {
        this.error = err.message;
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
      this.currentDetail = null; // 이전 거래 정보 노출 방지 (로딩 스켈레톤 표시)
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

    resetFilters() {
      this.filters = {
        ...getDefaultDateRange(),
        paymentSourceType: null,
        transactionType: null,
        cardId: null,
      };
    },

    setReturnedFromDetail(value) {
      this.returnedFromDetail = value;
    },
  },
});
