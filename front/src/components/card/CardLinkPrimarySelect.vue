<script setup>
import { ref } from 'vue';
import { CreditCard } from '@lucide/vue';
import CardPrimarySelectItem from '@/components/card/CardPrimarySelectItem.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';

defineProps({
  cards: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
});

const emit = defineEmits(['select', 'back']);

const selectedId = ref(null);
</script>

<template>
  <div class="flex flex-col w-full min-h-screen px-5 pt-4 pb-5 bg-canvas text-left">
    <div class="mb-6">
      <BaseHeader title="주 카드 선택" @back="$emit('back')" />
    </div>

    <div class="mb-5">
      <h2 class="text-heading font-bold text-ink leading-snug">
        주로 사용하는 카드를<br />선택해 주세요
      </h2>
      <p class="text-body-sm font-medium text-ink-sub mt-1">
        주 카드는 기본 결제 수단으로 지정돼요
      </p>
    </div>

    <div class="flex flex-col gap-3 flex-1 w-full">
      <CardPrimarySelectItem
        v-for="card in cards"
        :key="card.linkableCardId"
        :card="card"
        :is-selected="selectedId === card.linkableCardId"
        @select="selectedId = $event"
      />

      <div
        v-if="cards.length === 0 && !isLoading"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <div
          class="w-12 h-12 rounded-sheet bg-canvas flex items-center justify-center mb-3 text-ink-sub"
        >
          <CreditCard :size="24" />
        </div>
        <p class="text-body font-medium text-ink-sub">
          연동 가능한 카드가 없습니다
        </p>
      </div>
    </div>

    <div class="w-full pt-4 pb-2 mt-auto text-center">
      <BaseButton
        :disabled="!selectedId || isLoading"
        class="w-full"
        @click="emit('select', selectedId)"
      >
        {{ isLoading ? '연동하는 중...' : '주 카드로 설정하기' }}
      </BaseButton>
    </div>
  </div>
</template>
