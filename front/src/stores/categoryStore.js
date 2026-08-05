import { defineStore } from 'pinia';
import { getExpenseCategories, updateCategoryLabel } from '@/api/category';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    // 예산 유형별 카테고리 마스터. 자주 바뀌지 않아 한 번 받아두고 재사용한다
    categories: { WORK: [], PERSONAL: [] },
    isLoading: false,
    error: null,
  }),

  getters: {
    categoriesOf: (state) => (budgetType) => state.categories[budgetType] ?? [],
    // isDefault 는 화면에 처음부터 보여줄 카테고리를 뜻한다
    defaultCategoriesOf: (state) => (budgetType) =>
      (state.categories[budgetType] ?? []).filter(
        (category) => category.isDefault,
      ),
    categoryById: (state) => (budgetType, categoryId) =>
      (state.categories[budgetType] ?? []).find(
        (category) => category.id === categoryId,
      ),
  },

  actions: {
    async fetchCategories(budgetType, { force = false } = {}) {
      if (!force && this.categories[budgetType].length > 0) return;

      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getExpenseCategories(budgetType);
        this.categories[budgetType] = data.categories ?? [];
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // 별칭은 예산 유형과 무관하게 카테고리 단위로 저장된다
    async renameCategory(categoryId, customName) {
      try {
        const { data } = await updateCategoryLabel(categoryId, customName);
        Object.values(this.categories).forEach((list) => {
          const target = list.find((category) => category.id === categoryId);
          if (target) target.name = data.displayName;
        });
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },
  },
});
