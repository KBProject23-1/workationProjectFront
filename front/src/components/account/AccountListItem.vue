<script setup>
import { Star, X, Landmark } from '@lucide/vue';

defineProps({
  account: { type: Object, required: true },
});

defineEmits(['set-primary', 'delete']);
</script>

<template>
  <div
    class="flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all duration-200"
    :class="
      account.isPrimary
        ? 'border-blue-200 bg-blue-50/30 shadow-xs'
        : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200'
    "
  >
    <div class="flex items-center gap-3 min-w-0">
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors"
        :class="
          account.isPrimary
            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
            : 'bg-white text-gray-500 border-gray-100'
        "
      >
        <Landmark :size="18" />
      </div>

      <div class="min-w-0 text-left">
        <div class="flex items-center gap-1.5">
          <p class="text-[14px] font-bold text-gray-900 truncate">
            {{ account.bankName }}
          </p>
          <span
            v-if="account.isPrimary"
            class="text-[10px] font-extrabold text-blue-600 bg-blue-100/70 px-1.5 py-0.5 rounded-md shrink-0"
          >
            주 계좌
          </span>
        </div>
        <p class="text-[12px] font-medium text-gray-500 truncate mt-0.5">
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
              : 'text-gray-500 hover:text-gray-500'
          "
        />
      </button>

      <button
        type="button"
        class="p-2 rounded-full transition-colors hover:bg-red-50 hover:text-red-500 text-gray-500 active:scale-90"
        aria-label="계좌 삭제"
        @click="$emit('delete', account.accountId)"
      >
        <X :size="18" class="transition-colors hover:text-red-500" />
      </button>
    </div>
  </div>
</template>
