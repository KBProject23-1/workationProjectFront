<template>
  <div
    class="w-[138px] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200"
  >
    <div class="h-[92px] bg-slate-100">
      <img
        :src="thumbnailSource"
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
import { computed, ref, watch } from 'vue';
import { shortWon } from '@/components/workation/format';
import { getMerchantDefaultImage } from '@/config/merchantDefaultImages';

const props = defineProps({
  name: { type: String, required: true },
  merchantId: { type: [String, Number], default: null },
  category: { type: String, default: '' },
  activityType: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },
  rating: { type: [String, Number], default: null },
  price: { type: [String, Number], default: null },
});

const imageLoadFailed = ref(false);
const defaultThumbnail = computed(
  () => getMerchantDefaultImage({
    category: props.category,
    merchantId: props.merchantId,
    activityType: props.activityType,
  }),
);
const thumbnailSource = computed(
  () => props.thumbnailUrl && !imageLoadFailed.value
    ? props.thumbnailUrl
    : defaultThumbnail.value,
);

watch(
  () => [props.thumbnailUrl, props.category, props.activityType],
  () => {
    imageLoadFailed.value = false;
  },
);

// thumbnail_url 링크 오류 시 카테고리별 기본 이미지 표시
const onImageError = () => {
  imageLoadFailed.value = true;
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
