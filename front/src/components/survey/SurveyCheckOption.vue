<template>
  <button
    type="button"
    class="flex w-full items-center gap-2.5 rounded-lg border px-3 py-3 text-left"
    :class="[
      selected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white',
      disabled && !selected ? 'opacity-40' : '',
    ]"
    :disabled="disabled && !selected"
    @click="$emit('toggle', option.optionId)"
  >
    <span
      class="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-2 text-[11px] text-white"
      :class="selected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'"
    >
      <span v-if="selected">✓</span>
    </span>

    <span class="truncate text-xs font-bold text-slate-900">
      {{ option.optionText }}
    </span>
  </button>
</template>

<script setup>
defineProps({
  option: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  // 최대 선택 개수를 채웠을 때 나머지를 못 누르게 한다
  disabled: { type: Boolean, default: false },
});

defineEmits(['toggle']);
</script>
