<template>
  <button
    type="button"
    class="flex min-h-[30px] w-full items-center gap-2 rounded-chip border px-2 py-1.5 text-left transition"
    :class="[
      selected
        ? 'border-2 border-brand bg-white'
        : special
          ? 'border-dashed border-slate-400 bg-white'
          : 'border-line bg-white',
      disabled && !selected ? 'cursor-not-allowed opacity-40' : '',
    ]"
    :disabled="disabled && !selected"
    @click="$emit('toggle', option.optionId)"
  >
    <span
      class="flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 text-caption font-bold text-white"
      :class="selected ? 'border-brand bg-brand' : 'border-line'"
    >
      <span v-if="selected">✓</span>
    </span>

    <span class="truncate text-body-sm font-medium text-ink-sub">
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
