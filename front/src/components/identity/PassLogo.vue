<script setup>
// PASS 로고 배너 — PASS 레퍼런스의 빨간 4칸 로고를 재현 (이미지 에셋 대신 텍스트)
const LETTERS = ['P', 'A', 'S', 'S'];
</script>

<template>
  <div class="flex justify-center py-1">
    <div class="flex gap-1">
      <span
        v-for="(letter, index) in LETTERS"
        :key="index"
        class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E4141D] text-[20px] font-extrabold text-white shadow-sm"
      >
        {{ letter }}
      </span>
    </div>
  </div>
</template>
