<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  cards: { type: Array, default: () => [] },
});

defineEmits(['request-primary', 'request-delete', 'edit-nickname', 'add']);

const activeCardId = ref(
  props.cards.find((c) => c.isPrimary)?.cardId ??
    props.cards[0]?.cardId ??
    null,
);

const orderedCards = computed(() =>
  [...props.cards].sort(
    (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0),
  ),
);

const activeCard = computed(() =>
  props.cards.find((c) => c.cardId === activeCardId.value),
);

watch(
  () => props.cards,
  (newCards) => {
    if (!newCards.find((c) => c.cardId === activeCardId.value)) {
      activeCardId.value =
        newCards.find((c) => c.isPrimary)?.cardId ??
        newCards[0]?.cardId ??
        null;
    }
  },
);
</script>

<template>
  <div class="w-full">
    <div
      class="flex gap-3 overflow-x-auto snap-x snap-mandatory py-2 -mx-1 px-1"
    >
      <div
        v-for="card in orderedCards"
        :key="card.cardId"
        class="relative shrink-0 snap-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white px-4 py-3.5 flex flex-col justify-between cursor-pointer transition-all"
        :class="
          card.cardId === activeCardId ? 'w-48 h-32' : 'w-40 h-28 opacity-70'
        "
        @click="activeCardId = card.cardId"
      >
        <button
          type="button"
          class="absolute top-2 right-2 text-lg"
          @click.stop="$emit('request-primary', card.cardId)"
        >
          <span :class="card.isPrimary ? 'text-yellow-400' : 'text-white/40'"
            >★</span
          >
        </button>
        <span class="text-[11px] text-gray-300">{{ card.cardName }}</span>
        <span class="text-[13px] font-medium">{{ card.maskedNumber }}</span>
      </div>

      <button
        type="button"
        class="shrink-0 w-40 h-28 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center text-3xl text-gray-400"
        @click="$emit('add')"
      >
        +
      </button>
    </div>

    <div v-if="activeCard" class="flex gap-2 mt-3 px-1">
      <button
        type="button"
        class="flex-1 border rounded-xl py-2.5 text-[13px] text-gray-600"
        @click="$emit('edit-nickname', activeCard.cardId)"
      >
        별칭 변경
      </button>
      <button
        type="button"
        class="flex-1 border rounded-xl py-2.5 text-[13px] text-red-500"
        @click="$emit('request-delete', activeCard.cardId)"
      >
        삭제
      </button>
    </div>
  </div>
</template>
