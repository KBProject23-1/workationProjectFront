<template>
  <div
    class="w-[138px] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200"
  >
    <div class="h-[92px] bg-slate-100">
      <img
        :src="thumbnailUrl || defaultThumbnail"
        :alt="name"
        class="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        @error="onImageError"
      />
    </div>

    <div class="px-2.5 py-2">
      <p class="truncate text-xs font-semibold text-slate-900">
        {{ name }}
      </p>
      <p class="mt-0.5 truncate text-[11px] text-slate-500">
        {{ metaText }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { shortWon } from '@/components/workation/format';
import defaultThumbnail from '@/assets/images/merchant-default.webp';

const props = defineProps({
  name: { type: String, required: true },
  thumbnailUrl: { type: String, default: '' },
  rating: { type: [String, Number], default: null },
  price: { type: [String, Number], default: null },
});

// thumbnail_url 이 있어도 링크가 끊겨 있을 수 있다. 그때도 기본 이미지로 돌린다
const onImageError = (event) => {
  if (event.target.src !== defaultThumbnail) {
    event.target.src = defaultThumbnail;
  }
};

// 평점과 가격 중 있는 것만 붙인다. 둘 다 없으면 빈 줄이 남는다
const metaText = computed(() => {
  const parts = [];
  if (props.rating !== null && props.rating !== '') {
    parts.push(`★ ${Number(props.rating).toFixed(1)}`);
  }
  const price = shortWon(props.price);
  if (price) parts.push(price);
  return parts.join(' · ');
});
</script>
