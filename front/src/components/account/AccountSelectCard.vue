<script setup>
import { Check } from '@lucide/vue';

defineProps({
  account: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
});

defineEmits(['select']);
</script>

<template>
  <button
    type="button"
    class="flex items-center justify-between w-full px-4 py-3.5 border rounded-xl"
    :class="isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200'"
    @click="$emit('select', account.linkableAccountId)"
  >
    <div class="flex items-center gap-3 min-w-0">
      <div class="min-w-0">
        <p class="text-[15px] font-medium truncate">{{ account.bankName }}</p>
        <p class="text-[13px] text-gray-500 truncate">
          {{ account.maskedAccountNumber }}
        </p>
      </div>
    </div>
    <span
      class="w-5 h-5 rounded shrink-0 flex items-center justify-center border-2"
      :class="isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'"
    >
      <Check v-if="isSelected" :size="12" stroke="white" :stroke-width="3" />
    </span>
  </button>
</template>
