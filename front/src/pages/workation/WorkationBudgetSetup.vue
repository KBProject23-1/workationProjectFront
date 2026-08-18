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
      <h1 class="text-base font-bold text-slate-900">예산 세부 금액 설정</h1>
    </header>

    <!-- 마지막 단계다. 설문을 건너뛰었으면 2/2, 했으면 3/3 -->
    <template v-if="isCreateFlow">
      <div class="h-1 w-full rounded-full bg-blue-100">
        <div class="h-1 w-full rounded-full bg-blue-600" />
      </div>
      <p class="mt-1 text-right text-xs text-slate-400">
        {{ totalSteps }} / {{ totalSteps }}
      </p>
    </template>

    <div class="mt-4 grid grid-cols-2 rounded-xl bg-blue-50 p-1">
      <button
        v-for="tab in TABS"
        :key="tab.value"
        class="rounded-lg py-2 text-sm font-bold"
        :class="
          budgetType === tab.value
            ? 'bg-white text-blue-600'
            : 'bg-transparent text-slate-400'
        "
        @click="budgetType = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <p v-if="loading" class="py-20 text-center text-sm text-slate-400">
      불러오는 중...
    </p>

    <template v-else>
      <div
        class="mt-4 flex items-center justify-between border-b border-slate-100 pb-3"
      >
        <span class="text-sm text-slate-500">총 예산</span>
        <span class="text-lg font-bold text-slate-900">{{
          won(budgetTotal)
        }}</span>
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
            :class="[
              matched ? 'text-slate-900' : 'text-red-500',
              shaking ? 'shake' : '',
            ]"
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

      <Button
        class="mt-8 h-12 w-full rounded-xl text-base"
        :disabled="submitting"
        @click="submit"
      >
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

    <!--
      등록 도중 나가면 예산 없는 워케이션이 남는다.
      지출도 추천도 안 되는데 진행 중 워케이션은 하나만 허용되어 새로 만들 수도 없다.
    -->
    <BaseConfirmModal
      :visible="cancelOpen"
      title="예산 없이 나가시겠어요?"
      message="예산을 배정하지 않으면 지출을 기록할 수 없어요. 지금까지 입력한 워케이션 정보가 사라져요."
      :loading="canceling"
      confirm-label="등록 취소"
      cancel-label="계속 작성"
      @confirm="cancelRegistration"
      @cancel="cancelOpen = false"
    />

    <!--
      등록을 마친 직후가 추천을 권하기 제일 좋은 순간이다.
      여기서 놓쳐도 홈 카드로 다시 들어갈 수 있다.
    -->
    <BaseConfirmModal
      :visible="recommendOpen"
      title="워케이션 등록이 끝났어요"
      message="지금 바로 추천 장소를 확인해보시겠어요?"
      confirm-label="추천 확인하기"
      cancel-label="다음에 볼게요"
      @confirm="goRecommendation"
      @cancel="goWorkation"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import { ChevronLeft } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { useBudgetStore } from '@/stores/budgetStore';
import { useWorkationStore } from '@/stores/workationStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { useBudgetTypeLabel } from '@/composables/useBudgetTypeLabel';
import { won } from '@/components/workation/format';
import WorkationBudgetItem from '@/components/workation/WorkationBudgetItem.vue';
import WorkationCategoryAddSheet from '@/components/workation/WorkationCategoryAddSheet.vue';
import WorkationCategoryRenameSheet from '@/components/workation/WorkationCategoryRenameSheet.vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';

const TAB_VALUES = ['WORK', 'PERSONAL'];

const route = useRoute();
const router = useRouter();
const budgetStore = useBudgetStore();
const workationStore = useWorkationStore();
const categoryStore = useCategoryStore();
const { showError } = useErrorToast();

const workationId = route.params.workationId;

// 등록 흐름으로 들어왔는지, 메인화면 세부내역 보기로 들어왔는지 구분한다
const isCreateFlow = route.query.step === 'create';

// 설문을 거쳐 왔으면 3, 건너뛰었으면 2. 앞 화면이 넘겨준다.
// 설문 이력만 보고 판단하면 안 된다. 두 번째 워케이션도 이력은 있지만 2단계다.
// 예산 화면은 언제나 마지막이라 현재 단계가 곧 전체 단계 수다
const totalSteps = Number(route.query.steps) || 3;

const { workLabel, ensureCards } = useBudgetTypeLabel();

// 법인카드 보유 여부에 따라 법인 / 업무로 갈린다
const TABS = computed(() => [
  { value: 'WORK', label: `${workLabel.value} 예산` },
  { value: 'PERSONAL', label: '개인 예산' },
]);

const initialTab = TAB_VALUES.includes(route.query.budgetType)
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

// 마지막 단계를 마친 직후 뜨는 추천 안내
const recommendOpen = ref(false);

// 등록 도중 이탈 확인
const cancelOpen = ref(false);
const canceling = ref(false);

// 확인을 마치고 스스로 떠나는 중이면 라우터 가드를 통과시킨다
const leaving = ref(false);

const budgetTotal = computed(() => budgetTotals[budgetType.value]);
const categories = computed(() => categoryMap[budgetType.value]);

const currentTabLabel = computed(
  () => TABS.value.find((tab) => tab.value === budgetType.value)?.label ?? '',
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
  TAB_VALUES.every((value) => sumOf(value) === budgetTotals[value]),
);

const guideMessage = computed(() => {
  if (!matched.value) {
    return remainAmount.value < 0
      ? '배정 금액이 총예산을 넘었어요'
      : '배정 합계가 총예산과 일치해야 완료할 수 있어요';
  }
  if (!canSubmit.value) {
    const otherTab = TABS.value.find(
      (tab) => sumOf(tab.value) !== budgetTotals[tab.value],
    );
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
  return allCategoryMap[budgetType.value].filter(
    (category) => !usedIds.includes(category.id),
  );
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
  const budgets = await budgetStore.fetchBudgets(workationId);
  budgets.forEach((budget) => {
    const type = budget.budgetType;
    budgetTotals[type] = Number(budget.budgetTotal ?? 0);
    savedItems[type] = budget.items ?? [];
    alreadySet[type] = savedItems[type].length > 0;
  });
};

// 처음에는 기본 표출 카테고리만 보여준다. 나머지는 ＋ 목록에서 고른다
const loadCategories = async (type) => {
  await categoryStore.fetchCategories(type);
  allCategoryMap[type] = categoryStore.categoriesOf(type);
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
      amountMap[type][item.expenseCategoryId] = String(
        Number(item.targetAmount ?? 0),
      );
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
  TAB_VALUES.forEach((value) => {
    draft[value] = {
      categoryIds: categoryMap[value].map((category) => category.id),
      amounts: { ...amountMap[value] },
    };
  });
  localStorage.setItem(draftKey, JSON.stringify(draft));
};

const restoreDraft = () => {
  const saved = localStorage.getItem(draftKey);
  if (!saved) return;

  const draft = JSON.parse(saved);
  TAB_VALUES.forEach((type) => {
    const part = draft[type];
    if (!part) return;
    categoryMap[type] = sortCategories(
      type,
      allCategoryMap[type].filter((category) =>
        part.categoryIds.includes(category.id),
      ),
    );
    amountMap[type] = { ...part.amounts };
  });
};

onMounted(async () => {
  try {
    await Promise.all([
      loadBudgetStatus(),
      ensureCards(),
      loadCategories('WORK'),
      loadCategories('PERSONAL'),
    ]);
    TAB_VALUES.forEach((value) => buildRows(value));
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
    const wrongTab = TAB_VALUES.find(
      (value) => sumOf(value) !== budgetTotals[value],
    );
    if (wrongTab && wrongTab !== budgetType.value) {
      budgetType.value = wrongTab;
    }
    shake();
    return;
  }

  submitting.value = true;
  try {
    // 예산 유형별로 따로 저장한다. 이미 배정된 유형은 수정으로 보낸다
    for (const type of TAB_VALUES) {
      const payload = buildPayload(type);
      if (alreadySet[type]) {
        await budgetStore.updateBudget(workationId, payload);
      } else {
        await budgetStore.setupBudget(workationId, payload);
      }
    }
    localStorage.removeItem(draftKey);

    // 저장을 마쳤으니 이탈 확인을 걸지 않는다
    leaving.value = true;

    // 등록을 막 끝낸 경우에만 추천을 권한다.
    // 메인에서 예산만 고치러 들어온 경우는 그냥 돌아간다
    if (isCreateFlow) {
      recommendOpen.value = true;
      return;
    }
    router.push('/workation');
  } catch (error) {
    const errorCode = error.response?.data?.errorCode;

    // 설정과 수정 API 가 갈리는데, 다른 탭에서 먼저 저장하면 판정이 어긋난다.
    // 현재 배정 상태를 다시 받아 맞춘 뒤 사용자가 다시 저장하게 한다
    if (
      errorCode === 'BUDGET_ALREADY_EXISTS' ||
      errorCode === 'BUDGET_NOT_SET'
    ) {
      await loadBudgetStatus();
      showError(error, '예산 정보가 바뀌었어요. 다시 확인해 주세요.');
      return;
    }

    // 워케이션이 사라졌거나 정산이 끝나면 이 화면에 머물 이유가 없다
    if (errorCode === 'WORKATION_NOT_FOUND' || errorCode === 'ALREADY_SETTLED') {
      leaving.value = true;
      showError(error, '예산을 저장하지 못했습니다.');
      router.replace('/workation');
      return;
    }

    showError(error, '예산을 저장하지 못했습니다.');
  } finally {
    submitting.value = false;
  }
};

// 추천 확인을 선택하면 예약 가능한 장소 목록으로 이동한다
const goRecommendation = () => {
  recommendOpen.value = false;
  router.replace('/reservation/merchants');
};

// 추천을 나중에 확인하면 워케이션 홈으로 이동한다
const goWorkation = () => {
  recommendOpen.value = false;
  router.replace('/workation');
};

// 등록 도중 나가면 예산 없는 워케이션이 남으므로 확인을 받는다
const cancelRegistration = async () => {
  if (canceling.value) return;
  canceling.value = true;
  try {
    await workationStore.deleteWorkation(workationId);
    localStorage.removeItem(draftKey);
    leaving.value = true;
    router.replace('/workation');
  } catch (error) {
    showError(error, '등록을 취소하지 못했습니다.');
  } finally {
    canceling.value = false;
    cancelOpen.value = false;
  }
};

const goBack = () => {
  if (isCreateFlow) {
    cancelOpen.value = true;
    return;
  }
  router.push('/workation');
};

// 헤더 버튼뿐 아니라 브라우저 뒤로가기와 주소 직접 입력도 잡는다.
// 새로고침과 탭 닫기는 여기서 못 막는다. 그때는 홈의 이어서 설정하기 배너로 돌아온다
onBeforeRouteLeave(() => {
  if (!isCreateFlow || leaving.value) return true;
  cancelOpen.value = true;
  return false;
});
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
