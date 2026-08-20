<template>
  <button
    type="button"
    class="rounded-card shadow-card relative h-[156px] w-[208px] shrink-0 snap-start overflow-hidden transition-transform active:scale-[0.98]"
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
      class="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,20,40,0.05)_34%,rgba(4,20,40,0.76)_100%)]"
    />

    <span
      v-if="badge"
      class="text-navy absolute top-3 left-3 rounded-full bg-white/92 px-2.5 py-[5px] text-[10px] font-extrabold"
    >
      {{ badge }}
    </span>

    <span class="absolute right-3.5 bottom-3.5 left-3.5 text-left">
      <span class="text-heading block font-bold -tracking-[0.02em] text-white">
        {{ name }}
      </span>
      <span v-if="caption" class="text-caption mt-0.5 block text-white/78">
        {{ caption }}
      </span>
    </span>
  </button>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  image: { type: String, required: true },
  // 지원 방식. 사후 정산 / 제휴 예약
  badge: { type: String, default: '' },
  // 지원 한도 한 줄 요약
  caption: { type: String, default: '' },
});

defineEmits(['select']);
</script>
