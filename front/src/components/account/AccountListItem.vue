<template>
  <div class="flex items-center justify-between px-4 py-3.5 border rounded-xl">
    <div class="flex items-center gap-3 min-w-0">
      <div class="min-w-0">
        <p class="text-[15px] font-medium truncate">{{ account.bankName }}</p>
        <p class="text-[13px] text-gray-500 truncate">
          {{ account.maskedAccountNumber }}
        </p>
      </div>
    </div>
    <div class="flex items-center gap-3 shrink-0">
      <button type="button" @click="$emit('set-primary', account.accountId)">
        <Star
          :size="18"
          :class="
            account.isPrimary
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300'
          "
        />
      </button>
      <button type="button" @click="$emit('delete', account.accountId)">
        <X :size="18" class="text-gray-400" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { Star, X } from '@lucide/vue';

defineProps({
  account: { type: Object, required: true },
});

defineEmits(['set-primary', 'delete']);
</script>
