<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  card: { type: Object, required: true },
});

const emit = defineEmits(['update']);

const nickname = ref(props.card.cardName);

watch(nickname, (value) => {
  emit('update', value);
});
</script>

<template>
  <div class="w-full">
    <div class="border rounded-2xl px-5 py-6 mb-6 bg-slate-800 text-white">
      <p class="text-[15px] font-medium">{{ nickname || card.cardName }}</p>
      <p class="text-[13px] text-gray-300 mt-1">{{ card.maskedNumber }}</p>
    </div>

    <label class="text-[13px] text-gray-500 mb-2 block text-left">별칭</label>
    <input
      v-model="nickname"
      type="text"
      maxlength="100"
      placeholder="예: 여행경비 카드"
      class="w-full border rounded-xl px-4 py-3 text-[15px] mb-4"
    />
  </div>
</template>
