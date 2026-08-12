<script setup>
import { ref, computed } from 'vue';
import {
  ChevronRight,
  Plus,
  RotateCcw,
  History,
  QrCode,
  Eye,
  EyeOff,
} from '@lucide/vue';

const props = defineProps({
  balance: { type: Number, default: 0 },
});

defineEmits(['edit-accounts', 'charge', 'refund', 'history', 'pay']);

const isHidden = ref(false);
const displayBalance = computed(() =>
  isHidden.value ? '•••••' : props.balance.toLocaleString('ko-KR'),
);
</script>

<template>
  <div
    class="w-full rounded-[20px] bg-white p-4 text-left border border-gray-100 shadow-[0_12px_40px_rgba(0,0,0,0.03)]"
  >
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-1.5">
        <span class="text-[13px] font-bold text-gray-500 tracking-tight"
          >페이머니</span
        >
        <button
          type="button"
          class="text-gray-500 hover:text-gray-500 transition-colors"
          :aria-label="isHidden ? '잔액 표시' : '잔액 숨기기'"
          @click="isHidden = !isHidden"
        >
          <EyeOff v-if="isHidden" :size="14" />
          <Eye v-else :size="14" />
        </button>
      </div>

      <button
        type="button"
        class="text-[12px] font-medium text-gray-500 hover:text-gray-600 flex items-center gap-0.5 transition-colors"
        @click="$emit('edit-accounts')"
      >
        연결계좌
        <ChevronRight :size="13" />
      </button>
    </div>

    <div class="flex items-center justify-between mb-5">
      <div>
        <p
          class="text-[28px] font-extrabold tracking-tight text-gray-900 leading-none"
        >
          {{ displayBalance
          }}<span class="text-[20px] font-bold text-gray-800 ml-1">원</span>
        </p>
      </div>

      <button
        type="button"
        class="w-11 h-11 rounded-2xl bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 active:scale-95 transition-all shadow-md"
        aria-label="QR 결제"
        @click="$emit('pay')"
      >
        <QrCode :size="20" />
      </button>
    </div>

    <div class="mb-6 pt-1">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 hover:text-gray-900 transition-colors group"
        @click="$emit('history')"
      >
        <History :size="15" class="text-gray-500 group-hover:text-gray-600" />
        <span>이용내역 보기</span>
        <ChevronRight
          :size="14"
          class="text-gray-500 group-hover:translate-x-0.5 transition-transform"
        />
      </button>
    </div>

    <div class="flex gap-2 pt-2 border-t border-gray-100">
      <button
        type="button"
        class="flex-1 py-3.5 rounded-2xl bg-blue-50 text-blue-600 font-bold text-[14px] flex items-center justify-center gap-1.5 hover:bg-blue-100/70 active:scale-[0.98] transition-all"
        @click="$emit('charge')"
      >
        <Plus :size="16" />
        충전
      </button>

      <button
        type="button"
        class="flex-1 py-3.5 rounded-2xl bg-gray-50 text-gray-700 font-semibold text-[14px] flex items-center justify-center gap-1.5 hover:bg-gray-100 active:scale-[0.98] transition-all"
        @click="$emit('refund')"
      >
        <RotateCcw :size="15" />
        환불
      </button>
    </div>
  </div>
</template>
