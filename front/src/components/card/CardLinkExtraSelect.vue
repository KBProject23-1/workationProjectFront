<script setup>
import { ref } from 'vue';
import { CreditCard } from '@lucide/vue';
import CardSelectItem from '@/components/card/CardSelectItem.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';

defineProps({
  cards: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
});

defineEmits(['complete', 'skip', 'back']);

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
  <div class="flex flex-col w-full min-h-screen px-5 pt-4 pb-5 bg-canvas text-left">
    <div class="mb-6">
      <BaseHeader title="추가 카드 연동" @back="$emit('back')" />
    </div>

    <div class="mb-5 flex items-end justify-between">
      <div>
        <h2 class="text-heading font-bold text-ink leading-snug">
          함께 연동할 카드를<br />선택해 주세요
        </h2>
        <p class="text-body-sm font-medium text-ink-sub mt-1">
          다중 선택이 가능해요
        </p>
      </div>

      <span
        v-if="selectedIds.length > 0"
        class="text-body-sm font-bold text-brand bg-brand-weak px-2.5 py-1 rounded-chip shrink-0"
      >
        {{ selectedIds.length }}개 선택됨
      </span>
    </div>

    <div class="flex flex-col gap-3 flex-1 w-full">
      <CardSelectItem
        v-for="card in cards"
        :key="card.linkableCardId"
        :card="card"
        :is-selected="selectedIds.includes(card.linkableCardId)"
        @select="toggleSelect"
      />

      <div
        v-if="cards.length === 0"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <div
          class="w-12 h-12 rounded-sheet bg-canvas flex items-center justify-center mb-3 text-ink-sub"
        >
          <CreditCard :size="24" />
        </div>
        <p class="text-body font-medium text-ink-sub">
          추가로 연동할 수 있는 카드가 없어요
        </p>
      </div>
    </div>

    <div class="w-full pt-4 pb-2 mt-auto flex flex-col items-center gap-1.5">
      <BaseButton
        :disabled="selectedIds.length === 0 || isLoading"
        class="w-full"
        @click="$emit('complete', selectedIds)"
      >
        {{
          isLoading
            ? '연동하는 중...'
            : `${selectedIds.length > 0 ? selectedIds.length + '개 ' : ''}카드 연동하기`
        }}
      </BaseButton>

      <button
        type="button"
        class="w-full py-2.5 text-body-sm font-semibold text-ink-sub hover:text-ink-sub transition-colors text-center"
        @click="$emit('skip')"
      >
        다음에 할게요
      </button>
    </div>
  </div>
</template>
