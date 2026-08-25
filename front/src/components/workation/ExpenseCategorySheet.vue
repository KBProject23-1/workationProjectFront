<template>
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-navy/45"
    @click.self="$emit('close')"
  >
    <div
      class="rounded-t-sheet bg-surface max-h-[70vh] w-full max-w-[430px] overflow-y-auto px-5 pt-5 pb-8"
    >
      <!-- 손잡이. 아래로 끌어 닫는 시트라는 걸 알려준다 -->
      <span class="bg-line mx-auto mb-4 block h-1 w-9 rounded-full" />

      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-title font-bold -tracking-[0.01em] text-ink">
            {{ title }}
          </h2>
          <p v-if="description" class="text-body-sm mt-1 text-ink-mute">
            {{ description }}
          </p>
        </div>
        <button
          class="bg-canvas flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-sub"
          aria-label="닫기"
          @click="$emit('close')"
        >
          <X :size="16" />
        </button>
      </div>

      <div class="divide-line mt-4 divide-y">
        <button
          v-for="category in categories"
          :key="category.id"
          class="flex w-full items-center justify-between gap-3 py-3.5 text-left"
          @click="$emit('select', category.id)"
        >
          <span class="min-w-0">
            <span class="text-body block truncate font-semibold text-ink">
              {{ category.name }}
            </span>
            <span class="text-body-sm mt-0.5 block truncate text-ink-mute">
              {{ category.description }}
            </span>
          </span>

          <span
            v-if="category.id === selectedId"
            class="text-caption rounded-full bg-brand-weak text-brand shrink-0 px-2.5 py-1 font-bold"
          >
            선택됨
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { X } from '@lucide/vue';

defineProps({
  categories: { type: Array, required: true },
  selectedId: { type: Number, default: null },
  title: { type: String, default: '카테고리 변경' },
  description: { type: String, default: '' },
});

defineEmits(['select', 'close']);
</script>
