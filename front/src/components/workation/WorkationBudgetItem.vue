<template>
  <div class="flex items-start gap-3 py-3">
    <button
      type="button"
      class="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-slate-400"
      :class="
        deletable ? 'border-slate-300' : 'border-slate-200 text-slate-200'
      "
      :disabled="!deletable"
      @click="$emit('remove', category.id)"
    >
      −
    </button>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-1">
        <span class="truncate text-sm font-bold text-slate-900">{{
          category.name
        }}</span>
        <button
          type="button"
          class="shrink-0 text-slate-400"
          aria-label="이름 변경"
          @click="$emit('rename', category)"
        >
          <Pencil class="h-3.5 w-3.5" />
        </button>
      </div>
      <p class="truncate text-xs text-slate-400">{{ category.description }}</p>

      <div class="mt-2 h-1 w-full rounded-full bg-slate-200">
        <div
          class="h-1 rounded-full bg-blue-600"
          :style="{ width: ratio + '%' }"
        />
      </div>
    </div>

    <div class="relative w-32 shrink-0">
      <Input
        :model-value="displayAmount"
        inputmode="numeric"
        class="pr-8 text-right"
        @update:model-value="onInput"
        @blur="$emit('blur')"
      />
      <span
        class="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400"
        >원</span
      >
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Pencil } from '@lucide/vue';
import { Input } from '@/components/ui/input';

const props = defineProps({
  category: { type: Object, required: true },
  amount: { type: String, default: '' },
  budgetTotal: { type: Number, default: 0 },
  deletable: { type: Boolean, default: true },
});

const emit = defineEmits(['update:amount', 'remove', 'rename', 'blur']);

const toDigits = (value) => String(value ?? '').replace(/[^\d]/g, '');

const displayAmount = computed(() =>
  props.amount === '' ? '' : Number(props.amount).toLocaleString('ko-KR'),
);

// 총예산 대비 배정 비율. 총예산이 0 이면 막대를 그리지 않는다
const ratio = computed(() => {
  if (!props.budgetTotal) return 0;
  const value = Number(props.amount || 0);
  return Math.min((value / props.budgetTotal) * 100, 100);
});

const onInput = (value) => {
  emit('update:amount', toDigits(value));
};
</script>
