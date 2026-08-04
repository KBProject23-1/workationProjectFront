<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTransactionStore } from '@/stores/transactionStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { ChevronLeft } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';
import TransactionReceiptModal from '@/components/transaction/TransactionReceiptModal.vue';

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

const signedAmount = computed(() => {
  if (!detail.value) return '';
  const sign = isDeposit.value ? '+' : '-';
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
    await transactionStore.fetchTransactionDetail(transactionId); // 취소 후 최신 상세로 갱신
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
    class="flex flex-col items-center w-full min-h-screen px-5 py-6 bg-white"
  >
    <div class="w-full flex items-center mb-6">
      <button type="button" @click="router.back()">
        <ChevronLeft :size="24" />
      </button>
    </div>

    <template v-if="detail">
      <p class="w-full text-left text-2xl font-bold mb-6">{{ signedAmount }}</p>

      <div class="w-full border rounded-xl px-4 py-4 mb-6 text-left">
        <p class="text-[17px] font-medium mb-1">{{ detail.merchantName }}</p>
        <p class="text-[13px] text-gray-500 mb-4">
          {{ detail.categoryAssigned || '기타' }}
        </p>

        <div class="space-y-2 pt-3 border-t">
          <div class="flex justify-between text-[14px]">
            <span class="text-gray-500">거래 일시</span>
            <span>{{ detail.approvedAt }}</span>
          </div>
          <div
            v-if="detail.paymentSourceType === 'CARD'"
            class="flex justify-between text-[14px]"
          >
            <span class="text-gray-500">카드</span>
            <span>카드 결제</span>
          </div>
          <div class="flex justify-between text-[14px]">
            <span class="text-gray-500">승인번호</span>
            <span>{{ detail.approvedNumber }}</span>
          </div>
          <div class="flex justify-between text-[14px]">
            <span class="text-gray-500">상태</span>
            <span
              :class="
                detail.status === 'CANCELED' ? 'text-gray-400' : 'text-blue-600'
              "
            >
              {{
                detail.status === 'PAID'
                  ? '결제완료'
                  : detail.status === 'CANCELED'
                    ? '취소됨'
                    : '실패'
              }}
            </span>
          </div>
        </div>
      </div>

      <div class="w-full flex flex-col gap-2 mb-4">
        <BaseButton
          v-if="
            detail.transactionType === 'PAYMENT' && detail.status !== 'CANCELED'
          "
          class="w-full"
          @click="openReceipt"
        >
          매출전표 보기
        </BaseButton>
        <button
          v-if="canCancel"
          type="button"
          class="w-full border border-red-200 text-red-500 rounded-xl py-3 text-[15px]"
          @click="isCancelConfirmOpen = true"
        >
          거래 취소
        </button>
      </div>
    </template>

    <TransactionReceiptModal
      :visible="isReceiptOpen"
      :receipt="transactionStore.currentReceipt"
      @close="isReceiptOpen = false"
    />

    <BaseConfirmModal
      :visible="isCancelConfirmOpen"
      title="거래 취소"
      message="이 거래를 취소할까요? 취소 후에는 되돌릴 수 없어요."
      @confirm="handleCancel"
      @cancel="isCancelConfirmOpen = false"
    />
  </div>
</template>
