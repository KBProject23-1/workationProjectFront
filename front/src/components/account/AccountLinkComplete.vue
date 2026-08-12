<script setup>
import { Check, Landmark } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';

defineProps({
  linkedAccounts: { type: Array, default: () => [] },
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
        계좌 연동이 완료되었어요
      </h1>
      <p class="text-[14px] font-medium text-gray-500">
        선택하신 계좌가 정상적으로 서비스에 연결되었습니다
      </p>

      <div
        v-if="linkedAccounts.length > 0"
        class="w-full max-w-xs rounded-2xl bg-gray-50/80 p-4 border border-gray-100 text-left space-y-2.5 mt-8"
      >
        <p class="text-[12px] font-semibold text-gray-500 mb-1">
          연동된 계좌 ({{ linkedAccounts.length }})
        </p>

        <div
          v-for="acc in linkedAccounts"
          :key="acc.accountId"
          class="flex items-center justify-between text-[13px] bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div
              class="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"
            >
              <Landmark :size="14" />
            </div>
            <span class="font-bold text-gray-900 truncate">
              {{ acc.bankName }}
            </span>
            <span
              class="text-gray-500 font-medium text-[12px] font-mono truncate"
            >
              {{ acc.maskedAccountNumber }}
            </span>
          </div>
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
