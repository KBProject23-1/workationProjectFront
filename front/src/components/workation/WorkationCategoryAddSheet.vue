<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/40" @click.self="close">
    <div class="max-h-[70vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white px-5 pt-5 pb-8">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900">카테고리 추가</h2>
          <p class="mt-1 text-xs text-slate-400">{{ label }} 예산에 아직 추가하지 않은 항목이에요</p>
        </div>
        <button class="text-lg text-slate-400" @click="close">×</button>
      </div>

      <p v-if="categories.length === 0" class="py-10 text-center text-sm text-slate-400">
        추가할 수 있는 카테고리가 없어요
      </p>

      <div v-else class="mt-4 divide-y divide-slate-100">
        <div
          v-for="category in categories"
          :key="category.id"
          class="flex items-center gap-3 py-3"
        >
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold text-slate-900">{{ category.name }}</p>
            <p class="truncate text-xs text-slate-400">{{ category.description }}</p>
          </div>

          <button
            type="button"
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white"
            @click="$emit('add', category)"
          >
            ＋
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  categories: { type: Array, required: true },
  label: { type: String, default: '' },
});

const emit = defineEmits(['add', 'close']);

const close = () => {
  emit('close');
};
</script>
