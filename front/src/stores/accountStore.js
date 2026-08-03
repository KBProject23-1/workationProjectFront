import { defineStore } from 'pinia';
import {
  getAvailableAccounts,
  getMyAccounts,
  linkAccounts as linkAccountsApi,
  setPrimaryAccount as setPrimaryAccountApi,
  deleteAccount as deleteAccountApi,
} from '@/api/account';

export const useAccountStore = defineStore('account', {
  state: () => ({
    accounts: [], // 내 계좌 목록
    availableAccounts: [], // 연동 가능한 계좌 목록
    isLoading: false,
    error: null,
  }),

  getters: {
    primaryAccount: (state) => state.accounts.find((acc) => acc.isPrimary),
  },

  actions: {
    async fetchAvailableAccounts() {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getAvailableAccounts();
        this.availableAccounts = data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchMyAccounts() {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getMyAccounts();
        this.accounts = data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async linkAccounts(linkableAccountIds) {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await linkAccountsApi(linkableAccountIds);
        this.accounts = [...this.accounts, ...data];
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async setPrimaryAccount(accountId) {
      try {
        await setPrimaryAccountApi(accountId);
        this.accounts = this.accounts.map((acc) => ({
          ...acc,
          isPrimary: acc.accountId === accountId,
        }));
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async deleteAccount(accountId) {
      try {
        await deleteAccountApi(accountId);
        this.accounts = this.accounts.filter(
          (acc) => acc.accountId !== accountId,
        );
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },
  },
});
