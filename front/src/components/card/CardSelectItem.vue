<script setup>
import { CreditCard, Check } from '@lucide/vue';
import { formatCardNumber } from '@/utils/card';

defineProps({
  card: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
});

defineEmits(['select']);
</script>

<template>
  <button
    type="button"
    class="flex items-center justify-between w-full p-4 rounded-2xl border transition-all duration-200 active:scale-[0.99] text-left"
    :class="
      isSelected
        ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-600/20'
        : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200'
    "
    @click="$emit('select', card.linkableCardId)"
  >
    <div class="flex items-center gap-3.5 min-w-0">
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors"
        :class="
          isSelected
            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
            : 'bg-white text-gray-500 border-gray-100'
        "
      >
        <CreditCard :size="18" />
      </div>

      <div class="min-w-0">
        <p class="text-[14px] font-bold text-gray-900 truncate">
          {{ card.cardCompanyName }}
        </p>
        <p class="text-[12px] font-medium text-gray-400 truncate mt-0.5">
          {{ card.cardName }} · {{ formatCardNumber(card.maskedNumber) }}
        </p>
      </div>
    </div>

    <div
      class="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center transition-all duration-200"
      :class="
        isSelected
          ? 'bg-blue-600 text-white scale-100'
          : 'border-2 border-gray-200 bg-white scale-95'
      "
    >
      <Check v-if="isSelected" :size="14" :stroke-width="3" />
    </div>
  </button>
</template>
