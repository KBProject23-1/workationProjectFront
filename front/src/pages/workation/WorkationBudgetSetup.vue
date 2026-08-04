<template>
  <div class="min-h-screen bg-white px-5 pt-4 pb-8">
    <header class="relative mb-4 flex items-center justify-center">
      <button class="absolute left-0 text-xl text-slate-900" @click="goBack">‹</button>
      <h1 class="text-base font-bold text-slate-900">예산 세부 금액 설정</h1>
    </header>

    <template v-if="isCreateFlow">
      <div class="h-1 w-full rounded-full bg-blue-100">
        <div class="h-1 w-full rounded-full bg-blue-600" />
      </div>
      <p class="mt-1 text-right text-xs text-slate-400">2 / 2</p>
    </template>

    <div class="mt-4 grid grid-cols-2 rounded-xl bg-blue-50 p-1">
      <button
        v-for="tab in TABS"
        :key="tab.value"
        class="rounded-lg py-2 text-sm font-bold"
        :class="
          budgetType === tab.value ? 'bg-white text-blue-600' : 'bg-transparent text-slate-400'
        "
        @click="budgetType = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <p v-if="loading" class="py-20 text-center text-sm text-slate-400">불러오는 중...</p>

    <template v-else>
      <div class="mt-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <span class="text-sm text-slate-500">총 예산</span>
        <span class="text-lg font-bold text-slate-900">{{ won(budgetTotal) }}</span>
      </div>

      <div class="mt-3 flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-900">카테고리별 배정</h2>
        <button
          type="button"
          class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white"
          @click="sheetOpen = true"
        >
          ＋
        </button>
      </div>

      <div class="divide-y divide-slate-100">
        <WorkationBudgetItem
          v-for="category in categories"
          :key="category.id"
          :category="category"
          :amount="amountOf(category)"
          :budget-total="budgetTotal"
          :deletable="category.isDeletable"
          @update:amount="setAmount(category.id, $event)"
          @remove="removeCategory"
          @rename="openRename"
        />
      </div>

      <div class="mt-4 border-t border-slate-100 pt-3 text-sm">
        <div class="flex justify-between">
          <span class="text-slate-500">배정 합계</span>
          <span
            class="font-bold"
            :class="[matched ? 'text-slate-900' : 'text-red-500', shaking ? 'shake' : '']"
          >
            {{ won(assignedSum) }}
          </span>
        </div>
        <div class="mt-1 flex justify-between">
          <span class="text-slate-500">잔여</span>
          <span :class="matched ? 'text-blue-600' : 'text-red-500'">
            {{ won(remainAmount) }}
          </span>
        </div>
      </div>

      <Button class="mt-8 h-12 w-full rounded-xl text-base" :disabled="submitting" @click="submit">
        {{ submitting ? '저장 중...' : '완료' }}
      </Button>

      <p v-if="guideMessage" class="mt-2 text-center text-xs text-slate-400">
        {{ guideMessage }}
      </p>
    </template>

    <WorkationCategoryAddSheet
      v-if="sheetOpen"
      :categories="addableCategories"
      :label="currentTabLabel"
      @add="addCategory"
      @close="sheetOpen = false"
    />

    <WorkationCategoryRenameSheet
      v-if="renameTarget"
      :category="renameTarget"
      @saved="applyRename"
      @close="renameTarget = null"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { getBudgetStatus, setupBudget, updateBudget } from '@/api/budget';
import { getExpenseCategories } from '@/api/category';
import { useErrorToast } from '@/composables/useErrorToast';
import { won } from '@/components/workation/format';
import WorkationBudgetItem from '@/components/workation/WorkationBudgetItem.vue';
import WorkationCategoryAddSheet from '@/components/workation/WorkationCategoryAddSheet.vue';
import WorkationCategoryRenameSheet from '@/components/workation/WorkationCategoryRenameSheet.vue';

const TABS = [
  { value: 'WORK', label: '법인 예산' },
  { value: 'PERSONAL', label: '개인 예산' },
];

const route = useRoute();
const router = useRouter();
const { showError } = useErrorToast();

const workationId = route.params.workationId;

// 등록 흐름(2/2)으로 들어왔는지, 메인화면 세부내역 보기로 들어왔는지 구분한다
const isCreateFlow = route.query.step === 'create';

const initialTab = TABS.some((tab) => tab.value === route.query.budgetType)
  ? route.query.budgetType
  : 'WORK';

const budgetType = ref(initialTab);
const loading = ref(true);
const submitting = ref(false);

// 예산 유형별로 총예산, 전체 카테고리, 화면에 올린 카테고리, 입력 금액을 따로 들고 있는다
const budgetTotals = reactive({ WORK: 0, PERSONAL: 0 });
const savedItems = reactive({ WORK: [], PERSONAL: [] });
const alreadySet = reactive({ WORK: false, PERSONAL: false });
const allCategoryMap = reactive({ WORK: [], PERSONAL: [] });
const categoryMap = reactive({ WORK: [], PERSONAL: [] });
const amountMap = reactive({ WORK: {}, PERSONAL: {} });
const sheetOpen = ref(false);
const renameTarget = ref(null);
const shaking = ref(false);

const budgetTotal = computed(() => budgetTotals[budgetType.value]);
const categories = computed(() => categoryMap[budgetType.value]);

const currentTabLabel = computed(
  () => TABS.find((tab) => tab.value === budgetType.value)?.label ?? '',
);

const isEtc = (category) => category.code === 'ETC';

const amountOf = (category) => amountMap[budgetType.value][category.id] ?? '';

const sumOf = (type) =>
  categoryMap[type].reduce(
    (total, category) => total + Number(amountMap[type][category.id] || 0),
    0,
  );

const assignedSum = computed(() => sumOf(budgetType.value));
const remainAmount = computed(() => budgetTotal.value - assignedSum.value);

const matched = computed(() => assignedSum.value === budgetTotal.value);

// 두 유형 모두 총예산과 정확히 맞아야 저장할 수 있다
const canSubmit = computed(() =>
  TABS.every((tab) => sumOf(tab.value) === budgetTotals[tab.value]),
);

const guideMessage = computed(() => {
  if (!matched.value) {
    return remainAmount.value < 0
      ? '배정 금액이 총예산을 넘었어요'
      : '배정 합계가 총예산과 일치해야 완료할 수 있어요';
  }
  if (!canSubmit.value) {
    const otherTab = TABS.find((tab) => sumOf(tab.value) !== budgetTotals[tab.value]);
    return otherTab ? `${otherTab.label} 배정이 아직 총예산과 맞지 않아요` : '';
  }
  return '';
});

const setAmount = (categoryId, value) => {
  amountMap[budgetType.value][categoryId] = value;
};

const openRename = (category) => {
  renameTarget.value = category;
};

// 이름은 예산 유형별 목록 두 곳에 모두 반영한다
const applyRename = ({ categoryId, name }) => {
  const type = budgetType.value;
  [categoryMap[type], allCategoryMap[type]].forEach((list) => {
    const found = list.find((category) => category.id === categoryId);
    if (found) found.name = name;
  });
  renameTarget.value = null;
};

const removeCategory = (categoryId) => {
  categoryMap[budgetType.value] = categoryMap[budgetType.value].filter(
    (category) => category.id !== categoryId,
  );
  delete amountMap[budgetType.value][categoryId];
};

// 화면에 아직 올리지 않은 카테고리만 추가 목록에 보여준다
const addableCategories = computed(() => {
  const usedIds = categoryMap[budgetType.value].map((category) => category.id);
  return allCategoryMap[budgetType.value].filter((category) => !usedIds.includes(category.id));
});

// 기본 카테고리는 원래 순서를 지키고, 추가한 카테고리는 그 뒤에 넣은 순서대로 쌓는다
// 기타는 항상 맨 아래에 둔다
const addedSeq = reactive({ WORK: {}, PERSONAL: {} });
let addedCount = 0;

const sortCategories = (type, list) =>
  [...list].sort((a, b) => {
    if (isEtc(a)) return 1;
    if (isEtc(b)) return -1;
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    if (a.isDefault) return a.sortOrder - b.sortOrder;
    return (addedSeq[type][a.id] ?? 0) - (addedSeq[type][b.id] ?? 0);
  });

const addCategory = (category) => {
  const type = budgetType.value;
  if (!category.isDefault) {
    addedCount += 1;
    addedSeq[type][category.id] = addedCount;
  }
  categoryMap[type] = sortCategories(type, [...categoryMap[type], category]);
  amountMap[type][category.id] = '';
  sheetOpen.value = false;
};

// 총예산과 이미 배정된 금액을 함께 받는다. 배정 이력이 있으면 수정으로 저장한다
const loadBudgetStatus = async () => {
  const { data } = await getBudgetStatus(workationId);
  (data.budgets ?? []).forEach((budget) => {
    const type = budget.budgetType;
    budgetTotals[type] = Number(budget.budgetTotal ?? 0);
    savedItems[type] = budget.items ?? [];
    alreadySet[type] = savedItems[type].length > 0;
  });
};

// 처음에는 기본 표출 카테고리만 보여준다. 나머지는 ＋ 목록에서 고른다
const loadCategories = async (type) => {
  const { data } = await getExpenseCategories(type);
  allCategoryMap[type] = data.categories ?? [];
};

// 이미 배정한 이력이 있으면 그 카테고리와 금액을 그대로 보여준다
// 처음 배정하는 경우에는 기본 표출 카테고리만 빈 칸으로 올린다
const buildRows = (type) => {
  if (alreadySet[type]) {
    const saved = savedItems[type];
    const savedIds = saved.map((item) => item.expenseCategoryId);
    categoryMap[type] = sortCategories(
      type,
      allCategoryMap[type].filter((category) => savedIds.includes(category.id)),
    );
    saved.forEach((item) => {
      amountMap[type][item.expenseCategoryId] = String(Number(item.targetAmount ?? 0));
    });
    return;
  }

  categoryMap[type] = sortCategories(
    type,
    allCategoryMap[type].filter((category) => category.isDefault),
  );
  categoryMap[type].forEach((category) => {
    amountMap[type][category.id] = '';
  });
};

// 아직 저장하지 않은 배정 내용은 화면을 오가도 남도록 브라우저에 임시 보관한다
const draftKey = `workation-budget-draft-${workationId}`;

const saveDraft = () => {
  const draft = {};
  TABS.forEach((tab) => {
    draft[tab.value] = {
      categoryIds: categoryMap[tab.value].map((category) => category.id),
      amounts: { ...amountMap[tab.value] },
    };
  });
  sessionStorage.setItem(draftKey, JSON.stringify(draft));
};

const restoreDraft = () => {
  const saved = sessionStorage.getItem(draftKey);
  if (!saved) return;

  const draft = JSON.parse(saved);
  TABS.forEach((tab) => {
    const type = tab.value;
    const part = draft[type];
    if (!part) return;
    categoryMap[type] = sortCategories(
      type,
      allCategoryMap[type].filter((category) => part.categoryIds.includes(category.id)),
    );
    amountMap[type] = { ...part.amounts };
  });
};

onMounted(async () => {
  try {
    await Promise.all([loadBudgetStatus(), loadCategories('WORK'), loadCategories('PERSONAL')]);
    TABS.forEach((tab) => buildRows(tab.value));
    restoreDraft();
  } catch (error) {
    showError(error, '예산 정보를 불러오지 못했습니다.');
  } finally {
    loading.value = false;
  }
});

watch([categoryMap, amountMap], saveDraft, { deep: true });

const buildPayload = (type) => ({
  budgetType: type,
  items: categoryMap[type].map((category) => ({
    expenseCategoryId: category.id,
    targetAmount: Number(amountMap[type][category.id] || 0),
  })),
});

// 합계가 맞지 않으면 저장하지 않고 금액을 흔들어 알린다
const shake = () => {
  shaking.value = false;
  requestAnimationFrame(() => {
    shaking.value = true;
    setTimeout(() => {
      shaking.value = false;
    }, 400);
  });
};

const submit = async () => {
  if (submitting.value) return;
  if (!canSubmit.value) {
    const wrongTab = TABS.find((tab) => sumOf(tab.value) !== budgetTotals[tab.value]);
    if (wrongTab && wrongTab.value !== budgetType.value) {
      budgetType.value = wrongTab.value;
    }
    shake();
    return;
  }

  submitting.value = true;
  try {
    // 예산 유형별로 따로 저장한다. 이미 배정된 유형은 수정으로 보낸다
    for (const tab of TABS) {
      const payload = buildPayload(tab.value);
      if (alreadySet[tab.value]) {
        await updateBudget(workationId, payload);
      } else {
        await setupBudget(workationId, payload);
      }
    }
    sessionStorage.removeItem(draftKey);
    router.push('/workation');
  } catch (error) {
    showError(error, '예산을 저장하지 못했습니다.');
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  router.push(isCreateFlow ? '/workation/create' : '/workation');
};
</script>

<style scoped>
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

.shake {
  display: inline-block;
  animation: shake 0.2s ease-in-out 2;
}
</style>
