<script setup>
import { ref } from 'vue';
import CardSelectItem from '@/components/card/CardSelectItem.vue';
import BaseButton from '@/components/common/BaseButton.vue';

defineProps({
  cards: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
});

defineEmits(['complete', 'skip']);

const selectedIds = ref([]);

function toggleSelect(id) {
  const index = selectedIds.value.indexOf(id);
  if (index === -1) {
    selectedIds.value.push(id);
  } else {
    selectedIds.value.splice(index, 1);
  }
}
</script>

<template>
  <div
    class="flex flex-col items-center w-full min-h-screen px-5 py-6 text-center bg-white"
  >
    <h1 class="text-xl font-bold mb-2">추가 카드 연동</h1>
    <p class="text-[14px] text-gray-500 mb-4">
      더 등록할 카드가 있다면 선택해주세요
    </p>

    <div class="flex flex-col gap-3 flex-1 w-full text-left">
      <CardSelectItem
        v-for="card in cards"
        :key="card.linkableCardId"
        :card="card"
        :is-selected="selectedIds.includes(card.linkableCardId)"
        @select="toggleSelect"
      />
      <p
        v-if="cards.length === 0"
        class="text-[14px] text-gray-400 text-center mt-4"
      >
        추가로 연동할 수 있는 카드가 없어요
      </p>
    </div>

    <div class="w-full pb-4 flex flex-col gap-2">
      <BaseButton
        :disabled="selectedIds.length === 0 || isLoading"
        class="w-full"
        @click="$emit('complete', selectedIds)"
      >
        {{ isLoading ? '연동 중...' : '선택 완료' }}
      </BaseButton>
      <button
        type="button"
        class="text-[14px] text-gray-400 py-2"
        @click="$emit('skip')"
      >
        다음에 할게요
      </button>
    </div>
  </div>
</template>
