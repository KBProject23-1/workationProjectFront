<template>
  <button
    type="button"
    class="relative h-[124px] w-[164px] shrink-0 snap-start overflow-hidden rounded-2xl transition-transform active:scale-95"
    :aria-label="`${name} 워케이션 정보 보기`"
    @click="$emit('select')"
  >
    <img
      :src="image"
      :alt="`${name} 대표 이미지`"
      class="absolute inset-0 h-full w-full object-cover"
      loading="lazy"
      decoding="async"
    />

    <!-- 사진이 밝으면 흰 글씨가 묻힌다. 아래쪽만 어둡게 깐다 -->
    <span
      class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent"
    />

    <span
      class="absolute bottom-0 left-0 px-3 py-2.5 text-[15px] font-bold text-white"
    >
      {{ name }}
    </span>
  </button>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  image: { type: String, required: true },
});

defineEmits(['select']);
</script>
