<script setup>
defineProps({
  card: { type: Object, required: true },
});

defineEmits(['set-primary', 'delete']);
</script>

<template>
  <div class="flex items-center justify-between px-4 py-3.5 border rounded-xl">
    <div class="flex items-center gap-3 min-w-0">
      <div class="min-w-0">
        <p class="text-[15px] font-medium truncate">{{ card.cardName }}</p>
        <p class="text-[13px] text-gray-500 truncate">
          {{ card.maskedNumber }}
        </p>
      </div>
    </div>
    <div class="flex items-center gap-3 shrink-0">
      <button type="button" @click="$emit('set-primary', card.cardId)">
        <span :class="card.isPrimary ? 'text-yellow-400' : 'text-gray-300'"
          >★</span
        >
      </button>
      <button type="button" @click="$emit('delete', card.cardId)">
        <span class="text-gray-400">✕</span>
      </button>
    </div>
  </div>
</template>
