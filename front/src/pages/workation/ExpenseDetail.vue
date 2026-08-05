<template>
  <div class="min-h-screen bg-white px-5 pt-4 pb-8">
    <header class="relative mb-4 flex items-center justify-center">
      <button class="absolute left-0 text-xl text-slate-900" @click="goBack">‹</button>
      <h1 class="text-base font-bold text-slate-900">사용내역 상세</h1>
    </header>

    <p v-if="loading" class="py-20 text-center text-sm text-slate-400">불러오는 중...</p>

    <template v-else-if="detail">
      <div class="flex items-start justify-between">
        <span class="text-xs text-slate-400">{{ dotDate(detail.spentDate) }}</span>
        <button
          class="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-600"
          @click="budgetTypeSheetOpen = true"
        >
          {{ detail.budgetType === 'WORK' ? '법인 경비' : '개인 소비' }}
        </button>
      </div>

      <p class="mt-1 text-2xl font-bold text-slate-900">{{ won(detail.amount) }}</p>
      <p class="text-sm text-slate-500">{{ detail.merchantName }}</p>

      <p
        v-if="detail.isAutoCategorized"
        class="mt-4 rounded-md bg-blue-50 px-3 py-2 text-xs text-slate-500"
      >
        가맹점 업종을 보고 {{ detail.categoryName }}(으)로 분류했어요. 맞으면 그대로 두시면 됩니다
      </p>

      <section class="mt-6">
        <h2 class="mb-2 text-sm font-bold text-slate-900">결제 정보</h2>
        <dl class="rounded-xl border border-slate-200 px-4 py-3 text-sm">
          <div v-for="row in paymentRows" :key="row.label" class="flex justify-between py-1.5">
            <dt class="text-slate-500">{{ row.label }}</dt>
            <dd class="font-bold text-slate-900">{{ row.value }}</dd>
          </div>
        </dl>
      </section>

      <section class="mt-6">
        <h2 class="mb-2 text-sm font-bold text-slate-900">카테고리</h2>
        <div class="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-bold text-slate-900">{{ detail.categoryName }}</p>
            <p class="truncate text-xs text-slate-400">{{ currentCategoryDescription }}</p>
          </div>
          <button class="shrink-0 text-xs text-blue-600" @click="categorySheetOpen = true">
            변경
          </button>
        </div>
        <p class="mt-2 text-xs text-slate-400">
          변경하면 다음부터 이 가맹점은 바꾼 카테고리로 분류돼요
        </p>
      </section>

      <section class="mt-6">
        <h2 class="mb-2 text-sm font-bold text-slate-900">증빙</h2>
        <div class="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-bold text-slate-900">{{ proof.title }}</p>
            <p class="truncate text-xs text-slate-400">{{ proof.description }}</p>
          </div>
          <span
            class="shrink-0 rounded-full px-2 py-0.5 text-[11px]"
            :class="proof.done ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-500'"
          >
            {{ proof.done ? '완료' : '보완 필요' }}
          </span>
        </div>
      </section>

      <div v-if="isManual" class="mt-8 flex gap-2">
        <Button variant="outline" class="h-12 flex-1 rounded-xl text-base" @click="goEdit">
          수정
        </Button>
        <Button
          class="h-12 flex-1 rounded-xl bg-red-500 text-base hover:bg-red-600"
          :disabled="removing"
          @click="confirmOpen = true"
        >
          삭제
        </Button>
      </div>

      <p v-else class="mt-8 text-center text-xs text-slate-400">
        앱 내 결제 건은 수정하거나 삭제할 수 없어요
      </p>
    </template>

    <ExpenseCategorySheet
      v-if="categorySheetOpen"
      :categories="detail.availableCategories"
      :selected-id="detail.expenseCategoryId"
      @select="changeCategory"
      @close="categorySheetOpen = false"
    />

    <BaseConfirmModal
      :visible="confirmOpen"
      title="지출 내역을 삭제할까요?"
      message="삭제하면 예산 사용현황과 정산 내역에서도 빠집니다. 되돌릴 수 없어요."
      :loading="removing"
      @confirm="remove"
      @cancel="confirmOpen = false"
    />

    <ExpenseCategorySheet
      v-if="budgetTypeSheetOpen"
      title="경비 구분 변경"
      :description="`${targetBudgetTypeLabel}(으)로 옮길 카테고리를 골라 주세요`"
      :categories="targetBudgetTypeCategories"
      @select="changeBudgetType"
      @close="budgetTypeSheetOpen = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import {
  deleteExpense,
  getExpenseDetail,
  updateExpenseBudgetType,
  updateExpenseCategory,
} from '@/api/expense';
import { useCategoryStore } from '@/stores/categoryStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { dotDate, won } from '@/components/workation/format';
import ExpenseCategorySheet from '@/components/workation/ExpenseCategorySheet.vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';

const route = useRoute();
const router = useRouter();
const categoryStore = useCategoryStore();
const { showError } = useErrorToast();

const workationId = route.params.workationId;
const expenseId = route.params.expenseId;

const detail = ref(null);
const loading = ref(true);
const removing = ref(false);
const categorySheetOpen = ref(false);
const budgetTypeSheetOpen = ref(false);
const confirmOpen = ref(false);

// 앱 내 결제 건은 금액·날짜·가맹점명을 고칠 수 없다
const isManual = computed(() => detail.value?.sourceType === 'MANUAL');

const paymentRows = computed(() => {
  if (!detail.value) return [];
  const rows = [
    {
      label: '결제수단',
      value: detail.value.card
        ? `${detail.value.card.cardName} ${detail.value.card.maskedNumber ?? ''}`.trim()
        : '카드 미지정',
    },
    { label: '결제일자', value: dotDate(detail.value.spentDate) },
  ];
  if (detail.value.approvedNumber) {
    rows.push({ label: '승인번호', value: detail.value.approvedNumber });
  }
  if (detail.value.memo) {
    rows.push({ label: '메모', value: detail.value.memo });
  }
  return rows;
});

// 증빙은 저장하는 값이 아니라 지출 종류로 판정한다
const proof = computed(() => {
  const value = detail.value;
  if (!value) return { title: '', description: '', done: false };

  if (value.transactionId) {
    return {
      title: '거래내역 자동 증빙',
      description: '지갑 결제 건은 매출전표가 자동 생성돼요',
      done: true,
    };
  }
  if (value.budgetType === 'PERSONAL') {
    return { title: '증빙 대상 아님', description: '개인 소비는 증빙이 필요 없어요', done: true };
  }
  if (value.card) {
    return {
      title: '법인카드 사용 기록',
      description: '카드·가맹점·금액이 기재되어 증빙으로 인정돼요',
      done: true,
    };
  }
  return {
    title: '사용 카드 미지정',
    description: '회사 제출 시 결제 카드를 밝힐 수 없어요',
    done: false,
  };
});

const currentCategoryDescription = computed(
  () =>
    detail.value?.availableCategories?.find(
      (category) => category.id === detail.value.expenseCategoryId,
    )?.description ?? '',
);

const targetBudgetType = computed(() =>
  detail.value?.budgetType === 'WORK' ? 'PERSONAL' : 'WORK',
);

const targetBudgetTypeLabel = computed(() =>
  targetBudgetType.value === 'WORK' ? '법인 경비' : '개인 소비',
);

const targetBudgetTypeCategories = computed(() =>
  categoryStore.categoriesOf(targetBudgetType.value),
);

const loadDetail = async () => {
  loading.value = true;
  try {
    const { data } = await getExpenseDetail(expenseId);
    detail.value = data;
  } catch (error) {
    showError(error, '지출 정보를 불러오지 못했습니다.');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await Promise.all([
    loadDetail(),
    categoryStore.fetchCategories('WORK'),
    categoryStore.fetchCategories('PERSONAL'),
  ]);
});

const changeCategory = async (categoryId) => {
  try {
    await updateExpenseCategory(expenseId, categoryId);
    categorySheetOpen.value = false;
    await loadDetail();
  } catch (error) {
    showError(error, '카테고리를 변경하지 못했습니다.');
  }
};

const changeBudgetType = async (categoryId) => {
  try {
    await updateExpenseBudgetType(expenseId, targetBudgetType.value, categoryId);
    budgetTypeSheetOpen.value = false;
    await loadDetail();
  } catch (error) {
    showError(error, '경비 구분을 변경하지 못했습니다.');
  }
};

const remove = async () => {
  if (removing.value) return;
  removing.value = true;
  try {
    await deleteExpense(expenseId);
    router.push(`/workation/${workationId}/expenses`);
  } catch (error) {
    showError(error, '지출을 삭제하지 못했습니다.');
  } finally {
    removing.value = false;
  }
};

const goEdit = () => {
  router.push(`/workation/${workationId}/expenses/${expenseId}/edit`);
};

const goBack = () => {
  router.push(`/workation/${workationId}/expenses`);
};
</script>
