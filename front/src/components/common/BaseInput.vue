<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  placeholder: { type: String, default: '' },
  hasError: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="w-full text-left">
    <input
      :value="modelValue"
      type="text"
      inputmode="numeric"
      :placeholder="placeholder"
      class="w-full border border-gray-200 rounded-l px-4 py-3 text-[15px]"
      :class="hasError ? 'border-red-400' : 'border-gray-200'"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="hasError && errorMessage" class="text-[13px] text-red-500 mt-1.5">
      {{ errorMessage }}
    </p>
  </div>
</template>
