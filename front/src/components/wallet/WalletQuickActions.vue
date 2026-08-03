<script setup>
import { Plus, RotateCcw, History, QrCode } from '@lucide/vue';

defineEmits(['charge', 'refund', 'history', 'pay']);
</script>

<template>
  <div class="grid grid-cols-4 gap-2 w-full py-4">
    <button
      type="button"
      class="flex flex-col items-center gap-1.5"
      @click="$emit('charge')"
    >
      <span
        class="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center"
      >
        <Plus :size="20" />
      </span>
      <span class="text-[12px] text-gray-700">충전</span>
    </button>
    <button
      type="button"
      class="flex flex-col items-center gap-1.5"
      @click="$emit('refund')"
    >
      <span
        class="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center"
      >
        <RotateCcw :size="18" />
      </span>
      <span class="text-[12px] text-gray-700">환불</span>
    </button>
    <button
      type="button"
      class="flex flex-col items-center gap-1.5"
      @click="$emit('history')"
    >
      <span
        class="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center"
      >
        <History :size="18" />
      </span>
      <span class="text-[12px] text-gray-700">내역보기</span>
    </button>
    <button
      type="button"
      class="flex flex-col items-center gap-1.5"
      @click="$emit('pay')"
    >
      <span
        class="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center"
      >
        <QrCode :size="18" />
      </span>
      <span class="text-[12px] text-gray-700">결제</span>
    </button>
  </div>
</template>
