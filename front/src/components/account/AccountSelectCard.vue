<script setup>
import { Landmark } from '@lucide/vue';
import BaseSelectItem from '@/components/common/BaseSelectItem.vue';

defineProps({
  account: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
});

defineEmits(['select']);
</script>

<template>
  <BaseSelectItem
    :icon="Landmark"
    :title="account.bankName"
    :subtitle="account.maskedAccountNumber"
    :is-selected="isSelected"
    indicator-shape="square"
    mono-subtitle
    @select="$emit('select', account.linkableAccountId)"
  />
</template>
