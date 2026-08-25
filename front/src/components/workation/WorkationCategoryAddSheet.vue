<template>
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-navy/45"
    @click.self="close"
  >
    <div
      class="rounded-t-sheet bg-surface max-h-[70vh] w-full max-w-[430px] overflow-y-auto px-5 pt-5 pb-8"
    >
      <span class="bg-line mx-auto mb-4 block h-1 w-9 rounded-full" />

      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-title font-bold -tracking-[0.01em] text-ink">
            카테고리 추가
          </h2>
          <p class="text-body-sm mt-1 text-ink-mute">
            {{ label }} 예산에 아직 추가하지 않은 항목이에요
          </p>
        </div>
        <button
          class="bg-canvas flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-sub"
          aria-label="닫기"
          @click="close"
        >
          <X :size="16" />
        </button>
      </div>

      <p
        v-if="categories.length === 0"
        class="text-body-sm py-12 text-center text-ink-mute"
      >
        추가할 수 있는 카테고리가 없어요
      </p>

      <div v-else class="divide-line mt-4 divide-y">
        <div
          v-for="category in categories"
          :key="category.id"
          class="flex items-center gap-3 py-3.5"
        >
          <div class="min-w-0 flex-1">
            <p class="text-body truncate font-semibold text-ink">
              {{ category.name }}
            </p>
            <p class="text-body-sm mt-0.5 truncate text-ink-mute">
              {{ category.description }}
            </p>
          </div>

          <button
            type="button"
            class="bg-brand flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white transition-transform active:scale-95"
            :aria-label="`${category.name} 추가`"
            @click="$emit('add', category)"
          >
            <Plus :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Plus, X } from '@lucide/vue';

defineProps({
  categories: { type: Array, required: true },
  label: { type: String, default: '' },
});

const emit = defineEmits(['add', 'close']);

const close = () => {
  emit('close');
};
</script>
