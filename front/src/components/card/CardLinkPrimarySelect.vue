<script setup>
import { ref } from 'vue';
import CardPrimarySelectItem from '@/components/card/CardPrimarySelectItem.vue';
import BaseButton from '@/components/common/BaseButton.vue';

defineProps({
  cards: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
});

const emit = defineEmits(['select', 'back']);

const selectedId = ref(null);
</script>

<template>
  <div
    class="flex flex-col items-center w-full min-h-screen px-5 py-6 text-center bg-white"
  >
    <button
      type="button"
      class="text-2xl mb-4 self-start"
      @click="$emit('back')"
    >
      ‹
    </button>
    <h1 class="text-xl font-bold mb-6">카드 선택</h1>
    <p class="text-[14px] text-gray-500 mb-4">
      주로 사용하는 카드를 선택해주세요
    </p>

    <div class="flex flex-col gap-3 flex-1 w-full text-left">
      <CardPrimarySelectItem
        v-for="card in cards"
        :key="card.linkableCardId"
        :card="card"
        :is-selected="selectedId === card.linkableCardId"
        @select="selectedId = $event"
      />
    </div>

    <div class="w-full pb-4">
      <BaseButton
        :disabled="!selectedId || isLoading"
        class="w-full mt-6"
        @click="emit('select', selectedId)"
      >
        {{ isLoading ? '연동 중...' : '선택 완료' }}
      </BaseButton>
    </div>
  </div>
</template>
