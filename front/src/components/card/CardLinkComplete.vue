<script setup>
import { Check, CreditCard } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { formatCardNumber } from '@/utils/card';

defineProps({
  linkedCards: { type: Array, default: () => [] },
});

defineEmits(['confirm']);
</script>

<template>
  <div
    class="flex flex-col items-center w-full min-h-screen px-5 py-5 bg-white text-center"
  >
    <div
      class="flex-1 flex flex-col items-center justify-center w-full my-auto"
    >
      <div
        class="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 shadow-xs"
      >
        <Check :size="32" :stroke-width="3" class="text-blue-600" />
      </div>

      <h1 class="text-[22px] font-bold text-gray-900 mb-2">
        카드 연동이 완료되었어요
      </h1>
      <p class="text-[14px] font-medium text-gray-500">
        선택하신 카드가 정상적으로 서비스에 연결되었습니다
      </p>

      <div
        v-if="linkedCards.length > 0"
        class="w-full max-w-xs rounded-2xl bg-gray-50/80 p-4 border border-gray-100 text-left space-y-2.5 mt-8"
      >
        <p class="text-[12px] font-semibold text-gray-500 mb-1">
          연동된 카드 ({{ linkedCards.length }})
        </p>

        <div
          v-for="card in linkedCards"
          :key="card.cardId"
          class="flex items-center justify-between text-[13px] bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div
              class="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"
            >
              <CreditCard :size="14" />
            </div>
            <span class="font-bold text-gray-900 truncate">
              {{ card.cardCompanyName }}
            </span>
            <span class="text-gray-500 font-medium text-[12px] truncate">
              {{ formatCardNumber(card.maskedNumber) }}
            </span>
          </div>

          <span
            v-if="card.isPrimary"
            class="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md shrink-0 ml-2"
          >
            주 카드
          </span>
        </div>
      </div>
    </div>

    <div class="w-full pt-4 pb-2 mt-auto text-center">
      <BaseButton
        class="w-full py-3.5 text-[15px] font-bold rounded-2xl shadow-xs"
        @click="$emit('confirm')"
      >
        확인
      </BaseButton>
    </div>
  </div>
</template>
