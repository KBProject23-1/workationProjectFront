<template>
  <button
    type="button"
    class="flex min-h-[30px] w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition"
    :class="[
      selected
        ? 'border-2 border-blue-500 bg-white'
        : special
          ? 'border-dashed border-slate-400 bg-white'
          : 'border-slate-200 bg-white',
      disabled && !selected ? 'cursor-not-allowed opacity-40' : '',
    ]"
    :disabled="disabled && !selected"
    @click="$emit('toggle', option.optionId)"
  >
    <span
      class="flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 text-[10px] font-bold text-white"
      :class="selected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'"
    >
      <span v-if="selected">✓</span>
    </span>

    <span class="truncate text-xs font-medium text-slate-600">
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
  special: { type: Boolean, default: false },
});

defineEmits(['toggle']);
</script>
