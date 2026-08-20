<template>
  <article
    class="flex gap-4 rounded-card border border-line p-3 bg-surface shadow-card"
    role="link"
    tabindex="0"
    :aria-label="`${merchant.name} 상세보기`"
    @click="$emit('select', merchant)"
    @keydown.enter="$emit('select', merchant)"
    @keydown.space.prevent="$emit('select', merchant)"
  >
    <div
      class="flex h-[116px] w-[116px] shrink-0 items-center justify-center overflow-hidden rounded-chip"
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
        :class="merchant.bookmarked ? 'text-brand' : 'text-ink-mute'"
        :aria-label="merchant.bookmarked ? '북마크 해제' : '북마크 추가'"
        :aria-pressed="merchant.bookmarked"
        :disabled="merchant.bookmarkLoading"
        :aria-busy="merchant.bookmarkLoading"
        @click.stop="$emit('toggle-bookmark', merchant.merchantId)"
        @keydown.stop
      >
        <Heart :size="18" :fill="merchant.bookmarked ? 'currentColor' : 'none'" />
      </button>

      <h3 class="mr-9 truncate text-body font-bold text-ink">
        {{ merchant.name }}
      </h3>
      <p class="mt-1 truncate text-body-sm text-ink-mute">{{ merchant.address }}</p>

      <p class="mt-2 text-body-sm font-bold text-ink">
        <span class="text-warn">★</span>
        {{ merchant.rating }}
        <span class="font-medium text-ink-mute">
          · 리뷰 {{ merchant.reviewCount }}개
        </span>
      </p>

      <p v-if="reservable" class="mt-1.5 text-body-sm font-semibold text-teal-600">
        예약 하루 전까지 무료 취소
      </p>

      <p class="mt-1.5 text-right text-body-sm text-ink-sub">
        <strong class="text-heading font-bold text-ink">
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
  ACCOMMODATION: 'bg-brand-weak',
  OFFICE: 'bg-emerald-50',
  RESTAURANT: 'bg-warn-weak',
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
  () => THUMBNAIL_CLASSES[props.merchant.category] ?? 'bg-canvas',
);

const iconClass = computed(
  () => ICON_CLASSES[props.merchant.category] ?? 'text-ink-mute',
);

const priceUnit = computed(() => PRICE_UNITS[props.merchant.category] ?? '');
</script>
