<template>
  <fieldset class="mt-5">
    <legend class="mb-2 text-body font-bold text-ink">
      {{ label }}
    </legend>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in options"
        :key="String(option.value)"
        type="button"
        class="rounded-full border px-4 py-2 text-body-sm font-bold"
        :class="
          modelValue === option.value
            ? 'border-brand bg-brand text-white'
            : 'border-line text-ink-sub'
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
