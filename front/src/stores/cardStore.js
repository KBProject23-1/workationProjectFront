import { defineStore } from 'pinia';
import {
  getAvailableCards,
  getMyCards,
  getAllCardsForFilter,
  linkCards as linkCardsApi,
  setPrimaryCard as setPrimaryCardApi,
  updateCardNickname as updateCardNicknameApi,
  deleteCard as deleteCardApi,
} from '@/api/card';

export const useCardStore = defineStore('card', {
  state: () => ({
    cards: [],
    availableCards: [],
    allCardsForFilter: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    primaryCard: (state) => state.cards.find((card) => card.isPrimary),
    personalCards: (state) =>
      state.cards.filter((card) => card.cardType === 'PERSONAL'),
    workCards: (state) =>
      state.cards.filter((card) => card.cardType === 'WORK'),
  },

  actions: {
    async fetchAvailableCards() {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getAvailableCards();
        this.availableCards = data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchMyCards() {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getMyCards();
        this.cards = data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    // 거래 내역 카드별 필터용. 삭제된 카드도 포함해서 조회한다
    async fetchAllCardsForFilter() {
      try {
        const { data } = await getAllCardsForFilter();
        this.allCardsForFilter = data;
      } catch (err) {
        this.error = err.message;
      }
    },

    async linkCards(linkableCardIds) {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await linkCardsApi(linkableCardIds);
        this.cards = [...this.cards, ...data];
        this.availableCards = this.availableCards.filter(
          (card) => !linkableCardIds.includes(card.linkableCardId),
        );
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async setPrimaryCard(cardId) {
      try {
        await setPrimaryCardApi(cardId);
        this.cards = this.cards.map((card) => ({
          ...card,
          isPrimary: card.cardId === cardId,
        }));
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async updateCardNickname(cardId, cardNickname) {
      try {
        const { data } = await updateCardNicknameApi(cardId, cardNickname);
        const target = this.cards.find((card) => card.cardId === cardId);
        if (target) {
          target.cardName = data.cardName;
        }
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async deleteCard(cardId) {
      try {
        await deleteCardApi(cardId);
        await this.fetchMyCards();
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },
  },
});
