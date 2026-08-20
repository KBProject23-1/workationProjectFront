<script setup>
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { formatDateTime } from '@/utils/date';
import { formatCardNumber } from '@/utils/card';

defineProps({
  visible: { type: Boolean, default: false },
  receipt: { type: Object, default: null },
});

const emit = defineEmits(['close']);

function handleOpenChange(open) {
  if (!open) emit('close');
}
</script>

<template>
  <Dialog :open="visible" @update:open="handleOpenChange">
    <DialogContent class="max-w-sm">
      <div v-if="receipt" class="text-left">
        <div class="border-b pb-4 mb-4 space-y-1">
          <p class="text-title font-bold text-primary mb-2">가맹점 정보</p>
          <div class="flex justify-between text-body">
            <span class="text-ink-sub">가맹점명</span>
            <span>{{ receipt.merchant.name }}</span>
          </div>
          <div class="flex justify-between text-body">
            <span class="text-ink-sub">사업자등록번호</span>
            <span>{{ receipt.merchant.businessNumber }}</span>
          </div>
          <div class="flex justify-between text-body">
            <span class="text-ink-sub">주소</span>
            <span>{{ receipt.merchant.address }}</span>
          </div>
          <div class="flex justify-between text-body">
            <span class="text-ink-sub">전화번호</span>
            <span>{{ receipt.merchant.phoneNumber }}</span>
          </div>
        </div>

        <div class="border-b pb-4 mb-4 space-y-1">
          <p class="text-title font-bold text-primary mb-2">거래 정보</p>
          <div class="flex justify-between text-body">
            <span class="text-ink-sub">결제수단</span>
            <span>{{
              receipt.transaction.paymentMethod === 'CARD'
                ? '카드결제'
                : '지갑결제'
            }}</span>
          </div>
          <template v-if="receipt.transaction.paymentMethod === 'CARD'">
            <div class="flex justify-between text-body">
              <span class="text-ink-sub">카드</span>
              <span
                >{{ receipt.transaction.cardCompanyName }}
                {{ formatCardNumber(receipt.transaction.maskedCardNumber) }}</span
              >
            </div>
            <div class="flex justify-between text-body">
              <span class="text-ink-sub">승인상태</span>
              <span>{{ receipt.transaction.approvalStatus }}</span>
            </div>
            <div class="flex justify-between text-body">
              <span class="text-ink-sub">승인번호</span>
              <span>{{ receipt.transaction.approvalNumber }}</span>
            </div>
          </template>
          <div class="flex justify-between text-body">
            <span class="text-ink-sub">거래일시</span>
            <span>{{ formatDateTime(receipt.transaction.approvedAt) }}</span>
          </div>
        </div>

        <div class="space-y-1">
          <p class="text-title font-bold text-primary mb-2">결제 금액</p>
          <div class="flex justify-between text-body">
            <span class="text-ink-sub">공급가액</span>
            <span
              >{{
                receipt.payment.supplyAmount.toLocaleString('ko-KR')
              }}원</span
            >
          </div>
          <div class="flex justify-between text-body">
            <span class="text-ink-sub">부가세</span>
            <span>{{ receipt.payment.vat.toLocaleString('ko-KR') }}원</span>
          </div>
          <div class="flex justify-between text-heading font-bold pt-2 border-t">
            <span>합계</span>
            <span
              >{{ receipt.payment.totalAmount.toLocaleString('ko-KR') }}원</span
            >
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
