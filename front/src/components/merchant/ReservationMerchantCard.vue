<template>
  <article
    class="flex gap-4 rounded-xl border border-slate-200 p-3"
    role="link"
    tabindex="0"
    :aria-label="`${merchant.name} 상세보기`"
    @click="$emit('select', merchant)"
    @keydown.enter="$emit('select', merchant)"
    @keydown.space.prevent="$emit('select', merchant)"
  >
    <div
      class="flex h-[116px] w-[116px] shrink-0 items-center justify-center overflow-hidden rounded-lg"
      :class="thumbnailClass"
    >
      <img
        :src="thumbnailSource"
        :alt="`${merchant.name} 대표 이미지`"
        class="h-full w-full object-cover"
        @error="imageLoadFailed = true"
      />
    </div>

    <div class="relative min-w-0 flex-1">
      <button
        type="button"
        class="absolute top-0 right-0 p-0"
        :class="merchant.bookmarked ? 'text-blue-600' : 'text-slate-300'"
        :aria-label="merchant.bookmarked ? '북마크 해제' : '북마크 추가'"
        :aria-pressed="merchant.bookmarked"
        :disabled="merchant.bookmarkLoading"
        :aria-busy="merchant.bookmarkLoading"
        @click.stop="$emit('toggle-bookmark', merchant.merchantId)"
        @keydown.stop
      >
        <Heart :size="18" :fill="merchant.bookmarked ? 'currentColor' : 'none'" />
      </button>

      <h3 class="mr-9 truncate text-[15px] font-extrabold text-slate-900">
        {{ merchant.name }}
      </h3>
      <p class="mt-1 truncate text-[12px] text-slate-400">{{ merchant.address }}</p>

      <p class="mt-2 text-[12px] font-bold text-slate-700">
        <span class="text-amber-500">★</span>
        {{ merchant.rating }}
        <span class="font-medium text-slate-400">
          · 리뷰 {{ merchant.reviewCount }}개
        </span>
      </p>

      <p v-if="reservable" class="mt-1.5 text-[12px] font-semibold text-teal-600">
        예약 하루 전까지 무료 취소
      </p>

      <p class="mt-1.5 text-right text-[12px] text-slate-500">
        <strong class="text-[20px] font-extrabold text-slate-900">
          {{ Number(merchant.price ?? 0).toLocaleString() }}원
        </strong>
        {{ priceUnit }}
      </p>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { Heart } from '@lucide/vue';
import { getMerchantDefaultImage } from '@/config/merchantDefaultImages';

const THUMBNAIL_CLASSES = {
  ACCOMMODATION: 'bg-blue-50',
  OFFICE: 'bg-emerald-50',
  RESTAURANT: 'bg-amber-50',
  ACTIVITY: 'bg-violet-50',
};

// 1박·1일 단가는 예약 상품이 있는 숙소와 공유오피스에만 해당한다
const PRICE_UNITS = {
  ACCOMMODATION: '/ 1박',
  OFFICE: '/ 1일',
};

const props = defineProps({
  merchant: { type: Object, required: true },
});

defineEmits(['select', 'toggle-bookmark']);

const imageLoadFailed = ref(false);

watch(
  () => [props.merchant.thumbnailUrl, props.merchant.category],
  () => {
    imageLoadFailed.value = false;
  },
);

const reservable = computed(
  () =>
    props.merchant.category === 'ACCOMMODATION' ||
    props.merchant.category === 'OFFICE',
);

const thumbnailClass = computed(
  () => THUMBNAIL_CLASSES[props.merchant.category] ?? 'bg-slate-100',
);

const defaultThumbnail = computed(
  () => getMerchantDefaultImage({
    category: props.merchant.category,
    merchantId: props.merchant.merchantId,
    activityType: props.merchant.activityType,
  }),
);

const thumbnailSource = computed(
  () => props.merchant.thumbnailUrl && !imageLoadFailed.value
    ? props.merchant.thumbnailUrl
    : defaultThumbnail.value,
);

const priceUnit = computed(() => PRICE_UNITS[props.merchant.category] ?? '');
</script>
