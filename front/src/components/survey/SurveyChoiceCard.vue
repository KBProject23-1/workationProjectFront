<template>
  <button
    type="button"
    class="relative rounded-xl border p-4 text-left"
    :class="
      selected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'
    "
    @click="$emit('select', option.optionId)"
  >
    <!-- 아이콘 자리. 아이콘 일괄 작업 때 채운다 -->
    <span class="mb-3 block h-9 w-9 rounded-lg bg-slate-200" />

    <span class="block text-sm font-bold text-slate-900">
      {{ option.optionText }}
    </span>

    <span
      v-if="selected"
      class="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] text-white"
    >
      ✓
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
