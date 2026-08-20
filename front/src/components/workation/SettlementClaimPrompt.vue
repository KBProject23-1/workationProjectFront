<template>
  <section
    v-if="rows.length > 0"
    class="rounded-card bg-warn-weak mt-4 px-4 py-4"
  >
    <div class="flex items-start gap-3">
      <span
        class="text-caption bg-warn mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-bold text-white"
      >
        !
      </span>

      <div class="min-w-0 flex-1">
        <p class="text-body-sm font-bold text-ink">
          회사에 청구할 지출이 개인에 남아 있나요? · {{ candidates.length }}건
        </p>
        <p class="text-caption mt-0.5 text-ink-sub">
          {{
            showAll
              ? '개인 지출 전체예요. 청구할 것만 골라 주세요'
              : '업무 중 쓴 식비·교통비는 회사가 부담하기도 해요'
          }}
        </p>
      </div>
    </div>

    <div class="mt-3 space-y-2">
      <button
        v-for="expense in candidates"
        :key="expense.expenseId"
        class="rounded-chip bg-surface flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
        @click="togglePick(expense.expenseId)"
      >
        <span
          class="border-line flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
          :class="
            picked.includes(expense.expenseId)
              ? 'border-brand bg-brand text-white'
              : 'bg-surface'
          "
        >
          <Check v-if="picked.includes(expense.expenseId)" :size="13" />
        </span>

        <span class="min-w-0 flex-1">
          <span class="text-body-sm block truncate font-semibold text-ink">
            {{ expense.merchantName }}
          </span>
          <span class="text-caption mt-0.5 block text-ink-mute">
            {{ dotDate(expense.spentDate) }} · {{ expense.categoryName }}
          </span>
        </span>

        <span class="text-body-sm shrink-0 font-bold text-ink">
          {{ won(expense.amount) }}
        </span>
      </button>
    </div>

    <p
      v-if="candidates.length === 0"
      class="rounded-chip bg-surface text-body-sm mt-3 px-3 py-3.5 text-center text-ink-mute"
    >
      청구할 만한 지출이 없어요
    </p>

    <BaseButton
      variant="default"
      class="text-body-sm mt-3 h-11 w-full rounded-[12px] font-bold text-white"
      :disabled="picked.length === 0 || working"
      @click="claim"
    >
      {{ working ? '처리 중...' : `${picked.length}건 ${workLabel}로 옮기기` }}
    </BaseButton>

    <!-- 추천에 안 걸린 지출도 청구할 수 있어야 한다 -->
    <button
      v-if="hiddenCount > 0 || showAll"
      class="text-body-sm mt-2.5 w-full py-1 text-center font-bold text-ink-sub"
      @click="toggleShowAll"
    >
      {{ showAll ? '추천만 보기' : `다른 개인 지출도 보기 (${hiddenCount}건)` }}
    </button>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { Check } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { useExpenseStore } from '@/stores/expenseStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { useBudgetTypeLabel } from '@/composables/useBudgetTypeLabel';
import { dotDate, won } from './format';

// 실비 정산이 되는 항목. 개인카드로 냈어도 회사가 부담하는 게 일반적이다.
//
// 식비는 회사 정책에 따라 갈리지만 추천에 넣는다.
// 숙소·공유오피스 결제가 유입 단계에서 이미 업무로 분류되면서
// 개인에 남는 것이 대부분 식비와 여가비뿐이라, 식비를 빼면 추천이 통째로 빈다.
// 여가비는 업무로 볼 여지가 없어 전체 보기에서만 고른다
const CLAIMABLE_CODES = [
  'ACCOMMODATION',
  'TRANSPORTATION',
  'COMMUNICATION',
  'FOOD',
];

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

    // 추천이 하나도 없는데 개인 지출은 있으면 빈 목록만 보인다.
    // 그때는 전체를 펼쳐 고를 수 있게 한다
    if (rows.value.length > 0 && recommended.value.length === 0) {
      showAll.value = true;
    }
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
