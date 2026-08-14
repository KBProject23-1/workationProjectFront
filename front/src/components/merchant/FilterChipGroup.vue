<template>
  <fieldset class="mt-5">
    <legend class="mb-2 text-[14px] font-extrabold text-slate-900">
      {{ label }}
    </legend>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in options"
        :key="String(option.value)"
        type="button"
        class="rounded-full border px-4 py-2 text-[12px] font-bold"
        :class="
          modelValue === option.value
            ? 'border-blue-600 bg-blue-600 text-white'
            : 'border-slate-200 text-slate-600'
        "
        @click="$emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </fieldset>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  // { label, value } 목록. value 는 문자열이나 숫자를 모두 받는다
  options: { type: Array, required: true },
  modelValue: { type: [String, Number], default: '' },
});

defineEmits(['update:modelValue']);
</script>
