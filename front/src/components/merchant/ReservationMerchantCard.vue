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
        v-if="merchant.thumbnailUrl && !imageLoadFailed"
        :src="merchant.thumbnailUrl"
        :alt="`${merchant.name} 대표 이미지`"
        class="h-full w-full object-cover"
        @error="imageLoadFailed = true"
      />
      <component :is="categoryIcon" v-else class="h-8 w-8" :class="iconClass" />
    </div>

    <div class="relative min-w-0 flex-1">
      <button
        type="button"
        class="absolute top-0 right-0 p-0"
        :class="merchant.bookmarked ? 'text-blue-600' : 'text-slate-300'"
        :aria-label="merchant.bookmarked ? '북마크 해제' : '북마크 추가'"
        :aria-pressed="merchant.bookmarked"
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
import { computed, ref } from 'vue';
import { Bed, Building2, Heart, Ticket, UtensilsCrossed } from '@lucide/vue';

const CATEGORY_ICONS = {
  ACCOMMODATION: Bed,
  OFFICE: Building2,
  RESTAURANT: UtensilsCrossed,
  ACTIVITY: Ticket,
};

const THUMBNAIL_CLASSES = {
  ACCOMMODATION: 'bg-blue-50',
  OFFICE: 'bg-emerald-50',
  RESTAURANT: 'bg-amber-50',
  ACTIVITY: 'bg-violet-50',
};

const ICON_CLASSES = {
  ACCOMMODATION: 'text-blue-400',
  OFFICE: 'text-emerald-400',
  RESTAURANT: 'text-amber-400',
  ACTIVITY: 'text-violet-400',
};

// 1박·1일 단가는 예약 상품이 있는 숙소와 공유오피스에만 해당한다
const PRICE_UNITS = {
  ACCOMMODATION: '/ 1박',
  OFFICE: '/ 1일',
  RESTAURANT: '기준',
  ACTIVITY: '기준',
};

const props = defineProps({
  merchant: { type: Object, required: true },
});

defineEmits(['select', 'toggle-bookmark']);

const imageLoadFailed = ref(false);

const reservable = computed(
  () =>
    props.merchant.category === 'ACCOMMODATION' ||
    props.merchant.category === 'OFFICE',
);

const categoryIcon = computed(
  () => CATEGORY_ICONS[props.merchant.category] ?? Ticket,
);

const thumbnailClass = computed(
  () => THUMBNAIL_CLASSES[props.merchant.category] ?? 'bg-slate-100',
);

const iconClass = computed(
  () => ICON_CLASSES[props.merchant.category] ?? 'text-slate-400',
);

const priceUnit = computed(() => PRICE_UNITS[props.merchant.category] ?? '');
</script>
