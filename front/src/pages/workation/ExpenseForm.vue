<template>
  <div class="min-h-screen bg-white px-5 pt-4 pb-8">
    <header class="relative mb-4 flex items-center justify-center">
      <button
        class="absolute left-0 -ml-2 flex h-11 w-11 items-center justify-center text-slate-900"
        aria-label="뒤로 가기"
        @click="goBack"
      >
        <ChevronLeft class="h-7 w-7" />
      </button>
      <h1 class="text-base font-bold text-slate-900">
        {{ isEdit ? '지출 내역 수정하기' : '지출 내역 추가하기' }}
      </h1>
    </header>

    <p v-if="!isEdit" class="mb-4 text-xs text-slate-400">
      지갑으로 결제하지 않은 내역을 등록해 주세요
    </p>

    <div class="space-y-4">
      <div v-if="!isEdit">
        <p class="mb-1.5 text-sm font-bold text-slate-900">경비 구분</p>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="type in BUDGET_TYPES"
            :key="type.value"
            class="rounded-xl border py-3 text-sm font-bold"
            :class="
              form.budgetType === type.value
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-slate-200 text-slate-400'
            "
            @click="changeBudgetType(type.value)"
          >
            {{ type.label }}
          </button>
        </div>
      </div>

      <WorkationFormField
        v-if="form.budgetType === 'WORK'"
        label="사용한 카드"
        hint="필수"
        :error-message="errors.cardId"
      >
        <select
          v-model="form.cardId"
          class="border-input h-9 w-full rounded-md border bg-transparent px-3 text-base md:text-sm"
          :class="form.cardId ? 'text-slate-900' : 'text-slate-300'"
        >
          <option :value="null" disabled class="text-slate-300">
            카드를 선택해 주세요
          </option>
          <option
            v-for="card in workCards"
            :key="card.cardId"
            :value="card.cardId"
            class="text-slate-900"
          >
            {{ card.cardName }} {{ card.maskedNumber }}
          </option>
        </select>
        <p class="mt-1.5 text-xs text-slate-400">{{ cardHint }}</p>
      </WorkationFormField>

      <WorkationFormField label="가맹점명" :error-message="errors.merchantName">
        <Input
          v-model="form.merchantName"
          maxlength="150"
          placeholder="예) 제주공항 리무진"
          class="placeholder:text-slate-300"
        />
      </WorkationFormField>

      <div class="grid grid-cols-2 gap-3">
        <WorkationFormField label="사용일자" :error-message="errors.spentDate">
          <WorkationDateInput
            v-model="form.spentDate"
            placeholder="날짜 선택"
          />
        </WorkationFormField>

        <WorkationFormField label="사용금액" :error-message="errors.amount">
          <div class="relative">
            <Input
              :model-value="amountText"
              inputmode="numeric"
              class="pr-8 text-right"
              @update:model-value="onAmountInput"
            />
            <span
              class="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400"
              >원</span
            >
          </div>
        </WorkationFormField>
      </div>

      <WorkationFormField
        v-if="!isEdit"
        label="카테고리"
        :error-message="errors.expenseCategoryId"
      >
        <select
          v-model="form.expenseCategoryId"
          class="border-input h-9 w-full rounded-md border bg-transparent px-3 text-base md:text-sm"
          :class="form.expenseCategoryId ? 'text-slate-900' : 'text-slate-300'"
        >
          <option :value="null" disabled class="text-slate-300">
            카테고리를 선택해 주세요
          </option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
            class="text-slate-900"
          >
            {{ category.name }}
          </option>
        </select>
      </WorkationFormField>

      <WorkationFormField label="메모" hint="선택">
        <Input
          v-model="form.memo"
          maxlength="255"
          class="placeholder:text-slate-300"
        />
      </WorkationFormField>
    </div>

    <Button
      class="mt-8 h-12 w-full rounded-xl text-base"
      :disabled="submitting"
      @click="submit"
    >
      {{ submitting ? '저장 중...' : '저장하기' }}
    </Button>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft } from '@lucide/vue';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useExpenseStore } from '@/stores/expenseStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useCardStore } from '@/stores/cardStore';
import { useWorkationStore } from '@/stores/workationStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { useBudgetTypeLabel } from '@/composables/useBudgetTypeLabel';
import WorkationFormField from '@/components/workation/WorkationFormField.vue';
import WorkationDateInput from '@/components/workation/WorkationDateInput.vue';

const { workLabel, hasCorporateCard, ensureCards } = useBudgetTypeLabel();

const BUDGET_TYPES = computed(() => [
  { value: 'WORK', label: `${workLabel.value} 경비` },
  { value: 'PERSONAL', label: '개인 소비' },
]);

const route = useRoute();
const router = useRouter();
const expenseStore = useExpenseStore();
const budgetStore = useBudgetStore();
const cardStore = useCardStore();
const workationStore = useWorkationStore();
const { showError } = useErrorToast();

const workationId = route.params.workationId;
const expenseId = route.params.expenseId;
const isEdit = Boolean(expenseId);

// 수정은 상세에서, 등록은 목록에서 들어온다. 돌아갈 때 보던 목록 상태를 유지한다
const backLocation = isEdit
  ? {
      path: `/workation/${workationId}/expenses/${expenseId}`,
      query: { from: route.query.from },
    }
  : {
      path: `/workation/${workationId}/expenses`,
      query: JSON.parse(route.query.from ?? '{}'),
    };

const submitting = ref(false);

const form = reactive({
  budgetType: 'WORK',
  cardId: null,
  merchantName: '',
  spentDate: '',
  amount: '',
  expenseCategoryId: null,
  memo: '',
});

const errors = reactive({
  cardId: '',
  merchantName: '',
  spentDate: '',
  amount: '',
  expenseCategoryId: '',
});

// 법인카드가 있어도 개인카드로 업무 결제를 하는 일이 있다.
// 법인카드를 안 받는 가맹점이나 한도 초과 같은 경우다.
// 그래서 등록된 카드를 모두 고를 수 있게 하고, 법인카드를 위로 올린다
const workCards = computed(() => [
  ...cardStore.workCards,
  ...cardStore.personalCards,
]);

const cardHint = computed(() =>
  hasCorporateCard.value
    ? '개인카드로 결제한 건도 회사에 청구할 수 있어요'
    : '개인카드로 결제한 건을 회사에 청구할 수 있어요',
);

// 예산에 배정한 카테고리만 고를 수 있다. 배정하지 않은 카테고리는 집계할 곳이 없다
const assignedCategories = reactive({ WORK: [], PERSONAL: [] });
const categories = computed(() => assignedCategories[form.budgetType]);

const toDigits = (value) => String(value ?? '').replace(/[^\d]/g, '');
const amountText = computed(() =>
  form.amount === '' ? '' : Number(form.amount).toLocaleString('ko-KR'),
);

const onAmountInput = (value) => {
  form.amount = toDigits(value);
};

const loadDetail = async () => {
  const data = await expenseStore.fetchDetail(expenseId);
  form.budgetType = data.budgetType;
  form.cardId = data.card?.id ?? null;
  form.merchantName = data.merchantName ?? '';
  form.spentDate = data.spentDate ?? '';
  form.amount = String(Number(data.amount ?? 0));
  form.expenseCategoryId = data.expenseCategoryId ?? null;
  form.memo = data.memo ?? '';
};

const loadAssignedCategories = async () => {
  const budgets = await budgetStore.fetchBudgets(workationId);
  budgets.forEach((budget) => {
    assignedCategories[budget.budgetType] = (budget.items ?? []).map(
      (item) => ({
        id: item.expenseCategoryId,
        name: item.categoryName,
      }),
    );
  });
};

onMounted(async () => {
  try {
    await Promise.all([
      ensureCards(),
      loadAssignedCategories(),
      workationStore.fetchCurrent(),
    ]);
    if (isEdit) await loadDetail();
  } catch (error) {
    showError(error, '정보를 불러오지 못했습니다.');
  }
});

// 예산 유형이 바뀌면 카테고리 마스터가 달라지므로 카테고리만 비운다.
// 카드는 그대로 둔다. 개인 소비도 어떤 카드로 냈는지 남겨 두는 편이 낫다
const changeBudgetType = (value) => {
  form.budgetType = value;
  form.expenseCategoryId = null;
};

const validate = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = '';
  });

  if (form.budgetType === 'WORK' && !form.cardId) {
    errors.cardId = `${workLabel.value} 지출은 사용한 카드를 선택해야 합니다.`;
  }

  if (!form.merchantName.trim()) {
    errors.merchantName = '가맹점명을 입력해 주세요.';
  }

  if (!form.spentDate) {
    errors.spentDate = '사용일자를 선택해 주세요.';
  } else {
    const workation = workationStore.workation;
    if (
      workation &&
      (form.spentDate < workation.startDate ||
        form.spentDate > workation.endDate)
    ) {
      errors.spentDate = '워케이션 기간 안의 날짜여야 합니다.';
    }
  }

  if (form.amount === '' || Number(form.amount) <= 0) {
    errors.amount = '사용금액을 입력해 주세요.';
  }

  if (!isEdit && !form.expenseCategoryId) {
    errors.expenseCategoryId = '카테고리를 선택해 주세요.';
  }

  return Object.values(errors).every((message) => message === '');
};

const submit = async () => {
  if (!validate() || submitting.value) return;

  submitting.value = true;
  try {
    // 수정은 가맹점명·카드·금액·날짜·메모만 보낸다
    // 예산 유형과 카테고리는 상세 화면에서 따로 바꾼다
    const payload = {
      merchantName: form.merchantName.trim(),
      cardId: form.budgetType === 'WORK' ? form.cardId : null,
      amount: Number(form.amount),
      spentDate: form.spentDate,
      memo: form.memo.trim() || null,
    };

    if (isEdit) {
      await expenseStore.updateExpense(workationId, expenseId, payload);
    } else {
      await expenseStore.createExpense(workationId, {
        ...payload,
        budgetType: form.budgetType,
        expenseCategoryId: form.expenseCategoryId,
      });
    }

    router.push(backLocation);
  } catch (error) {
    // 어느 입력칸이 틀렸는지 알 수 있는 오류는 그 칸 아래에 표시한다.
    // 토스트로만 띄우면 사용자가 어디를 고쳐야 하는지 알 수 없다
    const errorCode = error.response?.data?.errorCode;

    const fieldOf = {
      MERCHANT_NAME_REQUIRED: 'merchantName',
      MERCHANT_NAME_TOO_LONG: 'merchantName',
      SPENT_DATE_REQUIRED: 'spentDate',
      SPENT_DATE_OUT_OF_PERIOD: 'spentDate',
      AMOUNT_INVALID: 'amount',
      CARD_REQUIRED: 'cardId',
      CARD_TYPE_MISMATCH: 'cardId',
      CARD_NOT_FOUND: 'cardId',
      CORPORATE_CARD_REQUIRED: 'cardId',
      CATEGORY_REQUIRED: 'expenseCategoryId',
      CATEGORY_TYPE_MISMATCH: 'expenseCategoryId',
    }[errorCode];

    if (fieldOf) {
      errors[fieldOf] = error.message;
      return;
    }

    // 정산이 끝났거나 워케이션이 사라진 경우. 이 화면에 더 머물 이유가 없다
    if (
      errorCode === 'ALREADY_SETTLED' ||
      errorCode === 'WORKATION_NOT_FOUND' ||
      errorCode === 'EXPENSE_NOT_FOUND'
    ) {
      showError(error, '지출을 저장하지 못했습니다.');
      router.replace(backLocation);
      return;
    }

    showError(error, '지출을 저장하지 못했습니다.');
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  router.push(backLocation);
};
</script>
