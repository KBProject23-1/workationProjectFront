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
    class="flex flex-col items-center w-full min-h-screen px-5 py-5 bg-canvas text-center"
  >
    <div
      class="flex-1 flex flex-col items-center justify-center w-full my-auto"
    >
      <div
        class="w-16 h-16 rounded-3xl bg-brand-weak border border-line flex items-center justify-center mb-6 shadow-xs"
      >
        <Check :size="32" :stroke-width="3" class="text-brand" />
      </div>

      <h1 class="text-display font-bold text-ink mb-2">
        계좌 연동이 완료되었어요
      </h1>
      <p class="text-body font-medium text-ink-sub">
        선택하신 계좌가 정상적으로 서비스에 연결되었습니다
      </p>

      <div
        v-if="linkedAccounts.length > 0"
        class="w-full max-w-xs rounded-sheet bg-canvas/80 p-4 border border-line text-left space-y-2.5 mt-8"
      >
        <p class="text-body-sm font-semibold text-ink-sub mb-1">
          연동된 계좌 ({{ linkedAccounts.length }})
        </p>

        <div
          v-for="acc in linkedAccounts"
          :key="acc.accountId"
          class="flex items-center justify-between text-body-sm bg-white p-2.5 rounded-card border border-line shadow-2xs"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div
              class="w-7 h-7 rounded-chip bg-brand-weak flex items-center justify-center text-brand shrink-0"
            >
              <Landmark :size="14" />
            </div>
            <span class="font-bold text-ink truncate">
              {{ acc.bankName }}
            </span>
            <span
              class="text-ink-sub font-medium text-body-sm font-mono truncate"
            >
              {{ acc.maskedAccountNumber }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full pt-4 pb-2 mt-auto text-center">
      <BaseButton
        class="w-full"
        @click="$emit('confirm')"
      >
        확인
      </BaseButton>
    </div>
  </div>
</template>
