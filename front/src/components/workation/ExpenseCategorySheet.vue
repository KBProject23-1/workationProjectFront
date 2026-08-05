<template>
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
    @click.self="$emit('close')"
  >
    <div
      class="max-h-[70vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white px-5 pt-5 pb-8"
    >
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900">{{ title }}</h2>
          <p v-if="description" class="mt-1 text-xs text-slate-400">
            {{ description }}
          </p>
        </div>
        <button class="text-lg text-slate-400" @click="$emit('close')">
          ×
        </button>
      </div>

      <div class="mt-4 divide-y divide-slate-100">
        <button
          v-for="category in categories"
          :key="category.id"
          class="flex w-full items-center justify-between gap-3 py-3 text-left"
          @click="$emit('select', category.id)"
        >
          <span class="min-w-0">
            <span class="block truncate text-sm font-bold text-slate-900">
              {{ category.name }}
            </span>
            <span class="block truncate text-xs text-slate-400">{{
              category.description
            }}</span>
          </span>

          <span
            v-if="category.id === selectedId"
            class="shrink-0 text-xs text-blue-600"
          >
            선택됨
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  categories: { type: Array, required: true },
  selectedId: { type: Number, default: null },
  title: { type: String, default: '카테고리 변경' },
  description: { type: String, default: '' },
});

defineEmits(['select', 'close']);
</script>
