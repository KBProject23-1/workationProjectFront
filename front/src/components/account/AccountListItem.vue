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
        <span :class="account.isPrimary ? 'text-yellow-400' : 'text-gray-300'"
          >★</span
        >
      </button>
      <button type="button" @click="$emit('delete', account.accountId)">
        <span class="text-gray-400">✕</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  account: { type: Object, required: true },
});

defineEmits(['set-primary', 'delete']);
</script>
