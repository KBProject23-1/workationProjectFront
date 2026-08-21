<template>
  <div class="flex items-start gap-2.5 py-4">
    <!-- 지울 수 없는 계정과목은 버튼을 그리지 않는다. 비활성 버튼이 남으면 눌러도 되는 줄 안다 -->
    <button
      v-if="deletable"
      type="button"
      class="border-line mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-ink-mute"
      :aria-label="`${category.name} 삭제`"
      @click="$emit('remove', category.id)"
    >
      <Minus :size="12" />
    </button>
    <span v-else class="mt-0.5 h-5 w-5 shrink-0" />

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-1.5">
        <span class="text-body truncate font-semibold text-ink">
          {{ category.name }}
        </span>
        <button
          type="button"
          class="shrink-0 text-ink-mute"
          aria-label="이름 변경"
          @click="$emit('rename', category)"
        >
          <Pencil :size="13" />
        </button>
      </div>
      <p class="text-body-sm mt-0.5 truncate text-ink-mute">
        {{ category.description }}
      </p>

      <div class="bg-canvas mt-2.5 h-1.5 w-full rounded-full">
        <div
          class="bg-brand h-1.5 rounded-full"
          :style="{ width: ratio + '%' }"
        />
      </div>
    </div>

    <div class="relative w-[124px] shrink-0">
      <Input
        :model-value="displayAmount"
        inputmode="numeric"
        class="rounded-chip text-body-sm h-11 pr-7 text-right"
        @update:model-value="onInput"
        @blur="$emit('blur')"
      />
      <span
        class="text-body-sm absolute top-1/2 right-3 -translate-y-1/2 text-ink-mute"
      >
        원
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Minus, Pencil } from '@lucide/vue';
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
