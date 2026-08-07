<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left"
    :class="
      selected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'
    "
    @click="$emit('select', option.optionId)"
  >
    <span
      class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
      :class="selected ? 'border-blue-600' : 'border-slate-300'"
    >
      <span v-if="selected" class="h-2.5 w-2.5 rounded-full bg-blue-600" />
    </span>

    <span class="text-sm font-bold text-slate-900">
      {{ option.optionText }}
    </span>
  </button>
</template>

<script setup>
defineProps({
  option: { type: Object, required: true },
  selected: { type: Boolean, default: false },
});

defineEmits(['select']);
</script>
