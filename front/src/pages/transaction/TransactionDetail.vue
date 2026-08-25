<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTransactionStore } from '@/stores/transactionStore';
import { useReviewStore } from '@/stores/reviewStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { toast } from 'vue-sonner';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';
import TransactionReceiptModal from '@/components/transaction/TransactionReceiptModal.vue';
import { formatDateTime } from '@/utils/date';
import { getStatusMeta, isInactiveStatus } from '@/utils/transactionStatus';

const router = useRouter();
const route = useRoute();
const transactionStore = useTransactionStore();
const reviewStore = useReviewStore();
const { showError } = useErrorToast();

const transactionId = Number(route.params.transactionId);
const isValidId = Number.isSafeInteger(transactionId) && transactionId > 0;
const isReceiptOpen = ref(false);
const isReviewDeleteConfirmOpen = ref(false);

const detail = computed(() => transactionStore.currentDetail);
const loading = ref(true); // 첫 렌더부터 스켈레톤 노출 (에러/빈 화면 깜빡임 방지)
const loadError = ref(false);

async function loadDetail() {
  if (!isValidId) {
    loading.value = false;
    loadError.value = true;
    return;
  }
  loading.value = true;
  loadError.value = false;
  await transactionStore.fetchTransactionDetail(transactionId);
  loading.value = false;
  // 조회가 끝났는데도 상세가 없으면 실패로 간주
  loadError.value = !transactionStore.currentDetail;
}

const isDeposit = computed(() => detail.value?.transactionType === 'DEPOSIT');
const statusMeta = computed(() => getStatusMeta(detail.value?.status));
// 취소/환불/실패 등 무효·역거래 상태 (금액 취소선 처리)
const isInactive = computed(() => isInactiveStatus(detail.value?.status));

const signedAmount = computed(() => {
  if (!detail.value) return '';
  const sign = isDeposit.value ? '+' : '';
  return `${sign}${detail.value.amount.toLocaleString('ko-KR')}원`;
});

const isReviewPeriodExpired = computed(() => detail.value?.reviewDeadline
  ? Date.now() > new Date(detail.value.reviewDeadline).getTime() : false);
const canWriteOrEditReview = computed(() => ['WRITE', 'EDIT'].includes(detail.value?.reviewAction));
const reviewButtonLabel = computed(() => {
  if (isReviewPeriodExpired.value) return detail.value?.reviewId ? '리뷰 수정 기간 만료' : '리뷰 작성 기간 만료';
  return detail.value?.reviewAction === 'EDIT' ? '리뷰 수정하기' : '리뷰 작성하기';
});
function goToReview() {
  if (!canWriteOrEditReview.value) return;
  router.push(detail.value.reviewAction === 'EDIT'
    ? `/reviews/${detail.value.reviewId}/edit`
    : `/transactions/${transactionId}/reviews/new`);
}

function closeReviewDeleteModal() {
  if (!reviewStore.isReviewDeleting) isReviewDeleteConfirmOpen.value = false;
}

async function confirmReviewDelete() {
  const deleted = await reviewStore.deleteMyReview(detail.value.reviewId);
  if (!deleted) {
    toast.error(reviewStore.reviewDeleteError || '리뷰 삭제에 실패했어요.');
    return;
  }
  isReviewDeleteConfirmOpen.value = false;
  await loadDetail();
  toast.success('리뷰가 삭제되었어요.');
}

async function openReceipt() {
  try {
    await transactionStore.fetchTransactionReceipt(transactionId);
    isReceiptOpen.value = true;
  } catch (err) {
    showError(err, '매출전표를 불러오지 못했어요.');
  }
}

onMounted(loadDetail);
</script>

<template>
  <main
    class="flex flex-col items-center w-full min-h-screen px-5 pt-4 pb-5 bg-canvas text-left"
  >
    <div class="w-full mb-6">
      <BaseHeader title="거래 상세" @back="router.back()" />
    </div>

    <!-- 로딩 스켈레톤 -->
    <div v-if="loading" class="w-full flex-1">
      <div class="h-6 w-24 animate-pulse rounded bg-canvas"></div>
      <div class="mt-2 h-8 w-40 animate-pulse rounded bg-canvas"></div>
      <div class="mt-3 h-10 w-48 animate-pulse rounded bg-canvas"></div>
      <div class="mt-6 h-40 w-full animate-pulse rounded-sheet bg-canvas"></div>
    </div>

    <!-- 에러 -->
    <div
      v-else-if="loadError"
      class="w-full flex-1 flex flex-col items-center justify-center text-center"
    >
      <BaseErrorState
        title="거래 정보를 불러오지 못했어요"
        :description="isValidId ? '잠시 후 다시 시도해주세요' : '올바르지 않은 거래예요'"
        :show-retry="isValidId"
        @retry="loadDetail"
      />
    </div>

    <template v-else-if="detail">
      <div class="w-full text-left mb-6">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-body-sm font-semibold text-ink-sub">
            {{ detail.categoryAssigned || '기타' }}
          </span>
          <span
            v-if="detail.status !== 'PAID'"
            class="text-caption font-bold px-1.5 py-0.5 rounded-chip"
            :class="statusMeta.badgeClass"
          >
            {{ statusMeta.label }}
          </span>
        </div>
        <p class="text-heading font-bold text-ink mb-2 truncate">
          {{ detail.merchantName }}
        </p>
        <p
          class="text-[32px] font-bold tracking-tight"
          :class="
            isInactive
              ? 'text-ink-sub line-through'
              : isDeposit
                ? 'text-brand'
                : 'text-ink'
          "
        >
          {{ signedAmount }}
        </p>
      </div>

      <div
        class="w-full rounded-sheet bg-canvas/80 p-5 mb-4 border border-line space-y-3.5"
      >
        <div class="flex justify-between items-center text-body-sm">
          <span class="text-ink-sub font-medium">거래 일시</span>
          <span class="font-semibold text-ink">{{
            formatDateTime(detail.approvedAt)
          }}</span>
        </div>

        <div class="flex justify-between items-center text-body-sm">
          <span class="text-ink-sub font-medium">결제 수단</span>
          <span class="font-semibold text-ink">{{
            detail.paymentSourceType === 'CARD' ? '카드 결제' : '지갑 결제'
          }}</span>
        </div>

        <div class="flex justify-between items-center text-body-sm">
          <span class="text-ink-sub font-medium">승인 번호</span>
          <span class="font-semibold text-ink font-mono">{{
            detail.approvedNumber
          }}</span>
        </div>

        <div
          class="flex justify-between items-center text-body-sm pt-3 border-t border-line/60"
        >
          <span class="text-ink-sub font-medium">거래 상태</span>
          <span class="font-bold text-body-sm" :class="statusMeta.textClass">
            {{ statusMeta.label }}
          </span>
        </div>
      </div>

      <div class="w-full mt-auto pt-4 pb-2 text-center">
        <div v-if="detail.reviewDeadline" class="mb-3 flex w-full gap-3">
          <BaseButton
            :disabled="!canWriteOrEditReview"
            class="min-w-0 flex-1 disabled:bg-gray-200 disabled:text-ink-mute"
            @click="goToReview"
          >
            {{ reviewButtonLabel }}
          </BaseButton>
          <BaseButton
            v-if="detail.reviewId"
            class="min-w-0 flex-1 text-[#3087ed]"
            @click="isReviewDeleteConfirmOpen = true"
          >
            리뷰 삭제하기
          </BaseButton>
        </div>
        <BaseButton
          v-if="
            detail.transactionType === 'PAYMENT' && detail.status === 'PAID'
          "
          class="w-full"
          @click="openReceipt"
        >
          매출전표 보기
        </BaseButton>
      </div>
    </template>

    <TransactionReceiptModal
      :visible="isReceiptOpen"
      :receipt="transactionStore.currentReceipt"
      @close="isReceiptOpen = false"
    />

    <BaseConfirmModal
      :visible="isReviewDeleteConfirmOpen"
      :title="'리뷰를 삭제하시면\n재작성이 불가합니다.'"
      message="삭제하시겠습니까?"
      cancel-label="닫기"
      confirm-label="확인"
      :loading="reviewStore.isReviewDeleting"
      @cancel="closeReviewDeleteModal"
      @confirm="confirmReviewDelete"
    />
  </main>
</template>
