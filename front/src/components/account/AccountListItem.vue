<script setup>
import { Star, X, Landmark } from '@lucide/vue';

defineProps({
  account: { type: Object, required: true },
});

defineEmits(['set-primary', 'delete']);
</script>

<template>
  <div
    class="flex items-center justify-between px-4 py-3.5 rounded-sheet border transition-all duration-200"
    :class="
      account.isPrimary
        ? 'border-brand bg-brand-weak/30 shadow-xs'
        : 'border-line bg-canvas/50 hover:bg-canvas hover:border-line'
    "
  >
    <div class="flex items-center gap-3 min-w-0">
      <div
        class="w-10 h-10 rounded-card flex items-center justify-center shrink-0 border transition-colors"
        :class="
          account.isPrimary
            ? 'bg-brand text-white border-brand shadow-xs'
            : 'bg-white text-ink-sub border-line'
        "
      >
        <Landmark :size="18" />
      </div>

      <div class="min-w-0 text-left">
        <div class="flex items-center gap-1.5">
          <p class="text-body font-bold text-ink truncate">
            {{ account.bankName }}
          </p>
          <span
            v-if="account.isPrimary"
            class="text-caption font-bold text-brand bg-brand-weak/70 px-1.5 py-0.5 rounded-chip shrink-0"
          >
            주 계좌
          </span>
        </div>
        <p class="text-body-sm font-medium text-ink-sub truncate mt-0.5">
          {{ account.maskedAccountNumber }}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-1 shrink-0">
      <button
        type="button"
        class="p-2 rounded-full transition-colors hover:bg-black/5 active:scale-90"
        aria-label="주 계좌 설정"
        @click="$emit('set-primary', account.accountId)"
      >
        <Star
          :size="18"
          :class="
            account.isPrimary
              ? 'text-yellow-400 fill-yellow-400 drop-shadow-xs'
              : 'text-ink-sub hover:text-ink-sub'
          "
        />
      </button>

      <button
        type="button"
        class="p-2 rounded-full transition-colors hover:bg-danger/10 hover:text-danger text-ink-sub active:scale-90"
        aria-label="계좌 삭제"
        @click="$emit('delete', account.accountId)"
      >
        <X :size="18" class="transition-colors hover:text-danger" />
      </button>
    </div>
  </div>
</template>
