import { defineStore } from 'pinia';
import {
  getMyWallet,
  chargeWallet as chargeWalletApi,
  refundWallet as refundWalletApi,
} from '@/api/wallet';

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    walletId: null,
    balance: 0,
    updatedAt: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchWallet() {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getMyWallet();
        this.walletId = data.walletId;
        this.balance = data.balance;
        this.updatedAt = data.updatedAt;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async charge(accountId, amount, pinNumber, idempotencyKey) {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await chargeWalletApi(
          accountId,
          amount,
          pinNumber,
          idempotencyKey,
        );
        // 응답 필드명이 currentBalance라 balance로 정규화
        this.balance = data.currentBalance;
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async refund(accountId, amount, pinNumber, idempotencyKey) {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await refundWalletApi(
          accountId,
          amount,
          pinNumber,
          idempotencyKey,
        );
        // 응답 필드명이 remainingBalance라 balance로 정규화
        this.balance = data.remainingBalance;
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
