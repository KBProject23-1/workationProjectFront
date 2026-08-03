<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6"
  >
    <div class="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
      <h2 class="text-lg font-bold mb-2">{{ title }}</h2>
      <p class="text-[14px] text-gray-500 mb-6">{{ message }}</p>
      <div class="flex gap-2">
        <button
          type="button"
          class="flex-1 border rounded-xl py-3 text-[15px] text-gray-600"
          @click="$emit('cancel')"
        >
          취소
        </button>
        <button
          type="button"
          class="flex-1 bg-blue-600 text-white rounded-xl py-3 text-[15px]"
          @click="$emit('confirm')"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
});

defineEmits(['confirm', 'cancel']);
</script>
