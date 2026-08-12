<template>
  <section
    v-if="rows.length > 0"
    class="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
  >
    <div class="flex items-start gap-3">
      <span
        class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white"
      >
        !
      </span>

      <div class="flex-1">
        <p class="text-sm font-bold text-slate-900">
          회사에 청구할 지출이 개인에 남아 있나요? · {{ candidates.length }}건
        </p>
        <p class="mt-0.5 text-xs text-slate-500">
          {{
            showAll
              ? '개인 지출 전체예요. 청구할 것만 골라 주세요'
              : '숙박비·교통비·통신비는 보통 회사가 부담해요'
          }}
        </p>
      </div>
    </div>

    <div class="mt-3 space-y-2">
      <button
        v-for="expense in candidates"
        :key="expense.expenseId"
        class="flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-left"
        @click="togglePick(expense.expenseId)"
      >
        <span
          class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
          :class="
            picked.includes(expense.expenseId)
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-slate-300'
          "
        >
          <Check v-if="picked.includes(expense.expenseId)" class="h-3 w-3" />
        </span>

        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-bold text-slate-900">
            {{ expense.merchantName }}
          </span>
          <span class="block text-xs text-slate-400">
            {{ dotDate(expense.spentDate) }} · {{ expense.categoryName }}
          </span>
        </span>

        <span class="shrink-0 text-sm font-bold text-slate-900">
          {{ won(expense.amount) }}
        </span>
      </button>
    </div>

    <p
      v-if="candidates.length === 0"
      class="mt-3 rounded-lg bg-white px-3 py-3 text-center text-xs text-slate-400"
    >
      청구할 만한 지출이 없어요
    </p>

    <Button
      class="mt-3 h-10 w-full rounded-lg text-sm"
      :disabled="picked.length === 0 || working"
      @click="claim"
    >
      {{ working ? '처리 중...' : `${picked.length}건 ${workLabel}로 옮기기` }}
    </Button>

    <!-- 추천에 안 걸린 지출도 청구할 수 있어야 한다 -->
    <button
      v-if="hiddenCount > 0 || showAll"
      class="mt-2 w-full text-center text-xs font-bold text-slate-500"
      @click="toggleShowAll"
    >
      {{ showAll ? '추천만 보기' : `다른 개인 지출도 보기 (${hiddenCount}건)` }}
    </button>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { Check } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { useExpenseStore } from '@/stores/expenseStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { useBudgetTypeLabel } from '@/composables/useBudgetTypeLabel';
import { dotDate, won } from './format';

// 실비 정산이 되는 항목. 개인카드로 냈어도 회사가 부담하는 게 일반적이다.
// 식비는 회사 정책에 따라 갈려서 기본 추천에 넣지 않는다. 전체 보기에서 고를 수 있다
const CLAIMABLE_CODES = ['ACCOMMODATION', 'TRANSPORTATION', 'COMMUNICATION'];

const props = defineProps({
  workationId: { type: [String, Number], required: true },
});

const emit = defineEmits(['claimed']);

const expenseStore = useExpenseStore();
const categoryStore = useCategoryStore();
const { showError } = useErrorToast();
const { workLabel } = useBudgetTypeLabel();

const rows = ref([]);
const picked = ref([]);
const working = ref(false);

const claimableCategoryIds = computed(() =>
  categoryStore
    .categoriesOf('PERSONAL')
    .filter((category) => CLAIMABLE_CODES.includes(category.code))
    .map((category) => category.id),
);

// 추천은 좁게 보여주고, 빠뜨릴 수 있으니 전체를 열어 둔다.
// 사용자가 만든 카테고리는 code 가 없어 추천에 안 잡히므로 전체 보기가 꼭 필요하다
const showAll = ref(false);

const recommended = computed(() =>
  rows.value.filter((expense) =>
    claimableCategoryIds.value.includes(expense.expenseCategoryId),
  ),
);

const candidates = computed(() => (showAll.value ? rows.value : recommended.value));

const hiddenCount = computed(() => rows.value.length - recommended.value.length);

const load = async () => {
  try {
    await categoryStore.fetchCategories('PERSONAL');
    const list = await expenseStore.fetchExpenses(props.workationId, {
      budgetType: 'PERSONAL',
      page: 0,
      size: 100,
    });
    rows.value = [...list];
  } catch (error) {
    showError(error, '개인 지출을 불러오지 못했습니다.');
  }
};

onMounted(load);

// 목록이 바뀌면 안 보이는 항목이 선택된 채로 남을 수 있어 선택을 비운다
const toggleShowAll = () => {
  showAll.value = !showAll.value;
  picked.value = [];
};

const togglePick = (expenseId) => {
  const index = picked.value.indexOf(expenseId);
  if (index === -1) {
    picked.value.push(expenseId);
    return;
  }
  picked.value.splice(index, 1);
};

const claim = async () => {
  if (working.value || picked.value.length === 0) return;

  working.value = true;
  try {
    await expenseStore.changeBudgetTypeBulk(props.workationId, 'WORK', [
      ...picked.value,
    ]);
    picked.value = [];
    await load();
    emit('claimed');
  } catch (error) {
    showError(error, '예산 유형을 바꾸지 못했습니다.');
  } finally {
    working.value = false;
  }
};
</script>
