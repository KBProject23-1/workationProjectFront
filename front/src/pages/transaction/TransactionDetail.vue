<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTransactionStore } from '@/stores/transactionStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { ChevronLeft, RotateCcw } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';
import TransactionReceiptModal from '@/components/transaction/TransactionReceiptModal.vue';
import { formatDateTime } from '@/utils/date';

const router = useRouter();
const route = useRoute();
const transactionStore = useTransactionStore();
const { showError } = useErrorToast();

const transactionId = Number(route.params.transactionId);
const isReceiptOpen = ref(false);
const isCancelConfirmOpen = ref(false);
const isCanceling = ref(false);

const detail = computed(() => transactionStore.currentDetail);

const isDeposit = computed(() => detail.value?.transactionType === 'DEPOSIT');
const isCanceled = computed(() => detail.value?.status === 'CANCELED');

const signedAmount = computed(() => {
  if (!detail.value) return '';
  const sign = isDeposit.value ? '+' : '';
  return `${sign}${detail.value.amount.toLocaleString('ko-KR')}원`;
});

const canCancel = computed(
  () =>
    detail.value?.transactionType === 'PAYMENT' &&
    detail.value?.status === 'PAID',
);

async function openReceipt() {
  try {
    await transactionStore.fetchTransactionReceipt(transactionId);
    isReceiptOpen.value = true;
  } catch (err) {
    showError(err, '매출전표를 불러오지 못했어요.');
  }
}

async function handleCancel() {
  isCanceling.value = true;
  try {
    await transactionStore.cancelTransaction(transactionId);
    await transactionStore.fetchTransactionDetail(transactionId);
  } catch (err) {
    showError(err, '거래 취소에 실패했어요.');
  } finally {
    isCanceling.value = false;
    isCancelConfirmOpen.value = false;
  }
}

onMounted(() => {
  transactionStore.fetchTransactionDetail(transactionId);
});
</script>

<template>
  <div
    class="flex flex-col items-center w-full min-h-screen px-5 py-5 bg-white text-left"
  >
    <div class="w-full flex items-center justify-between mb-6">
      <button
        type="button"
        class="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full active:bg-gray-100 transition-colors"
        @click="router.back()"
      >
        <ChevronLeft :size="24" />
      </button>
      <h1 class="text-[18px] font-bold text-gray-900">거래 상세</h1>
      <div class="w-[28px]"></div>
    </div>

    <template v-if="detail">
      <div class="w-full text-left mb-6">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[13px] font-semibold text-gray-400">
            {{ detail.categoryAssigned || '기타' }}
          </span>
          <span
            v-if="isCanceled"
            class="text-[11px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md"
          >
            승인취소
          </span>
        </div>
        <p class="text-[20px] font-bold text-gray-900 mb-2 truncate">
          {{ detail.merchantName }}
        </p>
        <p
          class="text-[32px] font-extrabold tracking-tight"
          :class="
            isCanceled
              ? 'text-gray-300 line-through'
              : isDeposit
                ? 'text-blue-600'
                : 'text-gray-900'
          "
        >
          {{ signedAmount }}
        </p>
      </div>

      <div
        class="w-full rounded-2xl bg-gray-50/80 p-5 mb-4 border border-gray-100 space-y-3.5"
      >
        <div class="flex justify-between items-center text-[13px]">
          <span class="text-gray-400 font-medium">거래 일시</span>
          <span class="font-semibold text-gray-800">{{
            formatDateTime(detail.approvedAt)
          }}</span>
        </div>

        <div class="flex justify-between items-center text-[13px]">
          <span class="text-gray-400 font-medium">결제 수단</span>
          <span class="font-semibold text-gray-800">{{
            detail.paymentSourceType === 'CARD' ? '카드 결제' : '지갑 결제'
          }}</span>
        </div>

        <div class="flex justify-between items-center text-[13px]">
          <span class="text-gray-400 font-medium">승인 번호</span>
          <span class="font-semibold text-gray-800 font-mono">{{
            detail.approvedNumber
          }}</span>
        </div>

        <div
          class="flex justify-between items-center text-[13px] pt-3 border-t border-gray-200/60"
        >
          <span class="text-gray-400 font-medium">거래 상태</span>
          <span
            class="font-bold text-[13px]"
            :class="
              detail.status === 'CANCELED' ? 'text-red-500' : 'text-blue-600'
            "
          >
            {{
              detail.status === 'PAID'
                ? '결제완료'
                : detail.status === 'CANCELED'
                  ? '승인취소'
                  : '실패'
            }}
          </span>
        </div>
      </div>

      <div v-if="canCancel" class="w-full flex justify-end px-1 mb-6">
        <button
          type="button"
          class="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-red-600 active:scale-95 transition-all py-1 px-2.5 rounded-lg hover:bg-red-50"
          @click="isCancelConfirmOpen = true"
        >
          <RotateCcw
            :size="14"
            class="text-gray-400 group-hover:text-red-500"
          />
          <span>결제 취소</span>
        </button>
      </div>

      <div class="w-full mt-auto pt-4 pb-2 text-center">
        <BaseButton
          v-if="
            detail.transactionType === 'PAYMENT' && detail.status !== 'CANCELED'
          "
          class="w-full py-3.5 text-[15px] font-bold rounded-2xl shadow-xs"
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
      :visible="isCancelConfirmOpen"
      :loading="isCanceling"
      title="거래 취소"
      message="이 거래를 취소할까요? 취소 후에는 되돌릴 수 없어요."
      @confirm="handleCancel"
      @cancel="isCancelConfirmOpen = false"
    />
  </div>
</template>
