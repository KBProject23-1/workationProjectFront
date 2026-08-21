<template>
  <component
    :is="clickable ? 'button' : 'div'"
    :type="clickable ? 'button' : undefined"
    class="rounded-card bg-surface shadow-card w-[150px] shrink-0 snap-start overflow-hidden text-left"
    :class="clickable ? 'transition-transform active:scale-[0.98]' : ''"
    @click="clickable && $emit('select')"
  >
    <div class="h-[104px] bg-brand-weak">
      <img
        :src="thumbnailSource"
        :alt="name"
        class="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        @error="onImageError"
      />
    </div>

    <div class="px-3 pt-2.5 pb-3">
      <p class="text-body-sm truncate font-semibold text-ink">
        {{ name }}
      </p>

      <div class="text-caption mt-1.5 flex items-center gap-1.5 text-ink-mute">
        <span v-if="ratingText" class="text-warn font-bold">
          ★ {{ ratingText }}
        </span>
        <span v-if="categoryLabel" class="truncate">{{ categoryLabel }}</span>
        <span
          v-if="priceText"
          class="text-body-sm ml-auto shrink-0 font-bold text-ink"
        >
          {{ priceText }}
        </span>
      </div>
    </div>
  </component>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { shortWon } from '@/components/workation/format';
import { getMerchantDefaultImage } from '@/config/merchantDefaultImages';

// merchants.category 는 네 가지뿐이다
const CATEGORY_LABEL = {
  ACCOMMODATION: '숙소',
  OFFICE: '공유오피스',
  RESTAURANT: '음식점',
  ACTIVITY: '여가',
};

const props = defineProps({
  name: { type: String, required: true },
  merchantId: { type: [String, Number], default: null },
  category: { type: String, default: '' },
  activityType: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },
  rating: { type: [String, Number], default: null },
  price: { type: [String, Number], default: null },
  // 상세로 보낼 수 있을 때만 버튼으로 만든다.
  // 업종을 모르면 어느 상세로 갈지 정할 수 없어 눌러도 아무 일이 없다
  clickable: { type: Boolean, default: false },
});

defineEmits(['select']);

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

const ratingText = computed(() => {
  if (props.rating === null || props.rating === '') return '';
  return Number(props.rating).toFixed(1);
});

const categoryLabel = computed(() => CATEGORY_LABEL[props.category] ?? '');

const priceText = computed(() => shortWon(props.price));
</script>
