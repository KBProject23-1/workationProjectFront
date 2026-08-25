<script setup>
import { CreditCard } from '@lucide/vue';
import { formatCardNumber } from '@/utils/card';
import BaseSelectItem from '@/components/common/BaseSelectItem.vue';

defineProps({
  card: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
});

defineEmits(['select']);
</script>

<template>
  <BaseSelectItem
    :icon="CreditCard"
    :title="card.cardCompanyName"
    :subtitle="`${card.cardName} · ${formatCardNumber(card.maskedNumber)}`"
    :is-selected="isSelected"
    indicator-shape="circle"
    @select="$emit('select', card.linkableCardId)"
  />
</template>
