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
      <h1 class="text-base font-bold text-slate-900">사용내역 상세</h1>
    </header>

    <p v-if="loading" class="py-20 text-center text-sm text-slate-400">
      불러오는 중...
    </p>

    <template v-else-if="detail">
      <div class="flex items-start justify-between">
        <span class="text-xs text-slate-400">{{
          dotDate(detail.spentDate)
        }}</span>
        <button
          class="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-600"
          @click="budgetTypeSheetOpen = true"
        >
          {{ detail.budgetType === 'WORK' ? `${workLabel} 경비` : '개인 소비' }}
          <ChevronDown class="h-3 w-3" />
        </button>
      </div>

      <p class="mt-1 text-2xl font-bold text-slate-900">
        {{ won(detail.amount) }}
      </p>
      <p class="text-sm text-slate-500">{{ detail.merchantName }}</p>

      <p
        v-if="detail.isAutoCategorized"
        class="mt-4 rounded-md bg-blue-50 px-3 py-2 text-xs text-slate-500"
      >
        가맹점 업종을 보고 {{ detail.categoryName }}(으)로 분류했어요. 맞으면
        그대로 두시면 됩니다
      </p>

      <section class="mt-6">
        <h2 class="mb-2 text-sm font-bold text-slate-900">결제 정보</h2>
        <dl class="rounded-xl border border-slate-200 px-4 py-3 text-sm">
          <div
            v-for="row in paymentRows"
            :key="row.label"
            class="flex justify-between py-1.5"
          >
            <dt class="text-slate-500">{{ row.label }}</dt>
            <dd class="font-bold text-slate-900">{{ row.value }}</dd>
          </div>
        </dl>
      </section>

      <section class="mt-6">
        <h2 class="mb-2 text-sm font-bold text-slate-900">카테고리</h2>
        <div
          class="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
        >
          <div class="min-w-0">
            <p class="truncate text-sm font-bold text-slate-900">
              {{ currentCategoryName }}
              <span v-if="categoryChanged" class="text-xs text-blue-600">
                변경됨
              </span>
            </p>
            <p class="truncate text-xs text-slate-400">
              {{ currentCategoryDescription }}
            </p>
          </div>
          <button
            class="shrink-0 rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-bold text-blue-600"
            @click="categorySheetOpen = true"
          >
            변경
          </button>
        </div>
        <p class="mt-2 text-xs text-slate-400">
          변경하면 다음부터 이 가맹점은 바꾼 카테고리로 분류돼요
        </p>
      </section>

      <section class="mt-6">
        <h2 class="mb-2 text-sm font-bold text-slate-900">증빙</h2>
        <div
          class="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
        >
          <div class="min-w-0">
            <p class="truncate text-sm font-bold text-slate-900">
              {{ proof.title }}
            </p>
            <p class="truncate text-xs text-slate-400">
              {{ proof.description }}
            </p>
          </div>
          <span
            class="shrink-0 rounded-full px-2 py-0.5 text-[11px]"
            :class="
              proof.done ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-500'
            "
          >
            {{ proof.done ? '완료' : '보완 필요' }}
          </span>
        </div>
      </section>

      <!--
        확인이 필요한 건은 분류가 맞다고 알려주는 버튼이 먼저다.
        이게 없으면 카테고리를 바꾸지 않는 한 확정할 방법이 없어
        뒤로 나가도 계속 "확인 필요" 로 남는다.
      -->
      <Button
        v-if="showConfirm"
        class="mt-8 h-12 w-full rounded-xl text-base"
        :disabled="confirming"
        @click="confirmAndClose"
      >
        {{ confirming ? '처리 중...' : '확인 완료' }}
      </Button>

      <p v-if="showConfirm" class="mt-2 text-center text-xs text-slate-400">
        {{
          categoryChanged
            ? '확인 완료를 누르면 바뀐 카테고리로 저장돼요'
            : '분류가 맞으면 확인 완료를, 아니면 위에서 카테고리를 바꿔 주세요'
        }}
      </p>

      <!-- 수기 등록 건만 금액·일시를 고칠 수 있다 -->
      <div v-if="isManual" class="mt-4 flex gap-2">
        <Button
          variant="outline"
          class="h-12 flex-1 rounded-xl text-base text-red-500 hover:text-red-600"
          :disabled="removing"
          @click="confirmOpen = true"
        >
          삭제하기
        </Button>
        <Button
          variant="outline"
          class="h-12 flex-1 rounded-xl text-base"
          @click="goEdit"
        >
          수정하기
        </Button>
      </div>

      <p
        v-if="!isManual && !showConfirm"
        class="mt-8 text-center text-xs text-slate-400"
      >
        앱 내 결제 건은 금액과 일시를 바꿀 수 없어요
      </p>
    </template>

    <ExpenseCategorySheet
      v-if="categorySheetOpen"
      :categories="detail.availableCategories"
      :selected-id="draftCategoryId"
      @select="pickCategory"
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
import { ChevronDown, ChevronLeft } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { storeToRefs } from 'pinia';
import { useExpenseStore } from '@/stores/expenseStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { useBudgetTypeLabel } from '@/composables/useBudgetTypeLabel';
import { dotDate, won } from '@/components/workation/format';
import ExpenseCategorySheet from '@/components/workation/ExpenseCategorySheet.vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';

const route = useRoute();
const router = useRouter();
const expenseStore = useExpenseStore();
const categoryStore = useCategoryStore();
const { showError } = useErrorToast();
const { workLabel, hasCorporateCard, ensureCards } = useBudgetTypeLabel();

const workationId = route.params.workationId;
const expenseId = route.params.expenseId;

// 목록에서 넘겨준 필터·페이지. 뒤로 갈 때 그대로 돌려준다
const listQuery = (() => {
  try {
    return JSON.parse(route.query.from ?? '{}');
  } catch {
    return {};
  }
})();

const listLocation = {
  path: `/workation/${workationId}/expenses`,
  query: listQuery,
};

const { detail } = storeToRefs(expenseStore);
const loading = ref(true);
const removing = ref(false);
const confirming = ref(false);
const categorySheetOpen = ref(false);
const budgetTypeSheetOpen = ref(false);
const confirmOpen = ref(false);

// 앱 내 결제 건은 금액·날짜·가맹점명을 고칠 수 없다
const isManual = computed(() => detail.value?.sourceType === 'MANUAL');

// 지갑 결제는 카드가 없는 게 정상이고, 개인 지출에 카드가 없으면 현금이다.
// 업무 지출에 카드가 없을 때만 증빙이 빈 상태다
const paymentMeans = computed(() => {
  const value = detail.value;
  if (!value) return '';

  if (value.card) {
    return `${value.card.cardName} ${value.card.maskedNumber ?? ''}`.trim();
  }
  if (value.paymentSourceType === 'WALLET') return '지갑';
  return value.budgetType === 'WORK' ? '카드 미지정' : '현금';
});

const paymentRows = computed(() => {
  if (!detail.value) return [];
  const rows = [
    { label: '결제수단', value: paymentMeans.value },
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
      description: '앱에서 결제한 건은 매출전표가 자동 생성돼요',
      done: true,
    };
  }
  if (value.budgetType === 'PERSONAL') {
    return {
      title: '증빙 대상 아님',
      description: '개인 소비는 증빙이 필요 없어요',
      done: true,
    };
  }
  if (value.card) {
    // 개인카드 결제는 적격증빙이 아니라, 지출결의서에 첨부하는 근거가 된다
    return hasCorporateCard.value
      ? {
          title: '법인카드 사용 기록',
          description: '카드·가맹점·금액이 기재되어 증빙으로 인정돼요',
          done: true,
        }
      : {
          title: '개인카드 사용 기록',
          description: '정산 문서에 첨부해 회사에 청구할 수 있어요',
          done: true,
        };
  }
  return {
    title: '사용 카드 미지정',
    description: '회사 제출 시 결제 카드를 밝힐 수 없어요',
    done: false,
  };
});

// 시트에서 고른 카테고리는 바로 저장하지 않고 여기에 담아 둔다.
// 고를 때마다 저장하면 요청이 네 번 나가서 화면이 버벅이고,
// 잘못 골랐을 때 되돌릴 방법도 없다
const draftCategoryId = ref(null);

const currentCategory = computed(() =>
  detail.value?.availableCategories?.find(
    (category) => category.id === draftCategoryId.value,
  ),
);

const currentCategoryName = computed(
  () => currentCategory.value?.name ?? detail.value?.categoryName ?? '',
);

const currentCategoryDescription = computed(
  () => currentCategory.value?.description ?? '',
);

// 카테고리를 바꿨는지
const categoryChanged = computed(
  () =>
    draftCategoryId.value !== null &&
    draftCategoryId.value !== detail.value?.expenseCategoryId,
);

// 확인이 필요한 건이거나, 카테고리를 바꿨을 때만 버튼을 보여준다
const showConfirm = computed(
  () => Boolean(detail.value?.isAutoCategorized) || categoryChanged.value,
);

const targetBudgetType = computed(() =>
  detail.value?.budgetType === 'WORK' ? 'PERSONAL' : 'WORK',
);

const targetBudgetTypeLabel = computed(() =>
  targetBudgetType.value === 'WORK' ? `${workLabel.value} 경비` : '개인 소비',
);

const targetBudgetTypeCategories = computed(() =>
  categoryStore.categoriesOf(targetBudgetType.value),
);

// 이 화면이 더 이상 성립하지 않는 오류들.
// 지출이 사라졌거나 정산이 끝나 수정할 수 없는 상태라 목록으로 돌려보낸다.
// 처리했으면 true 를 돌려준다
const leaveIfGone = (error, fallbackMessage) => {
  const errorCode = error.response?.data?.errorCode;

  if (
    errorCode === 'EXPENSE_NOT_FOUND' ||
    errorCode === 'WORKATION_NOT_FOUND' ||
    errorCode === 'ALREADY_SETTLED'
  ) {
    showError(error, fallbackMessage);
    router.replace(listLocation);
    return true;
  }
  return false;
};

const loadDetail = async () => {
  loading.value = true;
  try {
    const data = await expenseStore.fetchDetail(expenseId);
    draftCategoryId.value = data?.expenseCategoryId ?? null;
  } catch (error) {
    if (leaveIfGone(error, '지출 정보를 불러오지 못했습니다.')) return;
    showError(error, '지출 정보를 불러오지 못했습니다.');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await Promise.all([
    loadDetail(),
    ensureCards(),
    categoryStore.fetchCategories('WORK'),
    categoryStore.fetchCategories('PERSONAL'),
  ]);
});

// 고른 값만 담고 시트를 닫는다. 저장은 아래 확인 완료에서 한 번에 한다
const pickCategory = (categoryId) => {
  draftCategoryId.value = categoryId;
  categorySheetOpen.value = false;
};

const changeBudgetType = async (categoryId) => {
  try {
    await expenseStore.changeBudgetType(
      workationId,
      expenseId,
      targetBudgetType.value,
      categoryId,
    );
    // 예산 유형이 바뀌면 카테고리도 함께 바뀌므로 초안을 새 값으로 맞춘다
    draftCategoryId.value = categoryId;
    budgetTypeSheetOpen.value = false;
  } catch (error) {
    if (leaveIfGone(error, '경비 구분을 변경하지 못했습니다.')) return;

    // 바꾸려는 예산 유형에 없는 카테고리를 고른 경우. 시트를 열어 둔 채 다시 고르게 한다
    if (error.response?.data?.errorCode === 'CATEGORY_TYPE_MISMATCH') {
      showError(error, '변경할 예산 유형에 없는 카테고리입니다.');
      return;
    }

    budgetTypeSheetOpen.value = false;
    showError(error, '경비 구분을 변경하지 못했습니다.');
  }
};

const remove = async () => {
  if (removing.value) return;
  removing.value = true;
  try {
    await expenseStore.deleteExpense(workationId, expenseId);
    router.push(listLocation);
  } catch (error) {
    if (leaveIfGone(error, '지출을 삭제하지 못했습니다.')) return;
    showError(error, '지출을 삭제하지 못했습니다.');
  } finally {
    removing.value = false;
  }
};

// 카테고리를 바꿨으면 저장하고, 그대로면 확정만 한다.
// 카테고리 변경은 서버가 확정 처리까지 함께 하므로 두 번 부르지 않는다
const confirmAndClose = async () => {
  if (confirming.value) return;

  confirming.value = true;
  try {
    if (categoryChanged.value) {
      await expenseStore.changeCategory(
        workationId,
        expenseId,
        draftCategoryId.value,
      );
    } else if (detail.value?.isAutoCategorized) {
      await expenseStore.confirmExpenses(workationId, [Number(expenseId)]);
    }
    router.push(listLocation);
  } catch (error) {
    if (leaveIfGone(error, '저장하지 못했습니다.')) return;

    // 예산에서 빠진 카테고리를 고른 경우. 다시 고를 수 있게 시트를 연다
    if (error.response?.data?.errorCode === 'CATEGORY_TYPE_MISMATCH') {
      categorySheetOpen.value = true;
      showError(error, '선택한 카테고리를 사용할 수 없습니다.');
      return;
    }

    showError(error, '저장하지 못했습니다.');
  } finally {
    confirming.value = false;
  }
};

const goEdit = () => {
  router.push({
    path: `/workation/${workationId}/expenses/${expenseId}/edit`,
    query: { from: route.query.from },
  });
};

const goBack = () => {
  router.push(listLocation);
};
</script>
