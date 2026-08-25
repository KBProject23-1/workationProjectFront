<script setup>
import AtmosphereTagSelector from '@/components/review/AtmosphereTagSelector.vue';
import { computed } from 'vue';
import { useMerchantImage } from '@/composables/useMerchantImage';

const emit = defineEmits(['open']);

const props = defineProps({
  review: { type: Object, required: true },
});

const thumbnailClasses = {
  ACCOMMODATION: 'bg-brand-weak text-blue-400',
  OFFICE: 'bg-emerald-50 text-emerald-400',
  RESTAURANT: 'bg-warn-weak text-amber-400',
  ACTIVITY: 'bg-violet-50 text-violet-400',
};

const thumbnailUrl = computed(
  () => props.review.imageUrl || props.review.merchantThumbnailUrl,
);

const { imageSource, handleImageError } = useMerchantImage({
  thumbnailUrl,
  category: () => props.review.category,
  merchantId: () => props.review.merchantId,
  activityType: () => props.review.activityType,
});

const thumbnailClass = computed(
  () => thumbnailClasses[props.review.category] ?? 'bg-canvas text-ink-mute',
);

function formatDate(value) {
  return value.slice(0, 10).replaceAll('-', '.');
}
</script>

<template>
  <article
    class="review-card flex gap-4 rounded-card border border-line p-3 bg-surface shadow-card"
    role="link"
    tabindex="0"
    :aria-label="`${review.merchantName} 리뷰 상세보기`"
    @click="emit('open', review.reviewId)"
    @keydown.enter="emit('open', review.reviewId)"
    @keydown.space.prevent="emit('open', review.reviewId)"
  >
    <div class="review-thumbnail" :class="thumbnailClass">
      <img
        :src="imageSource"
        :alt="`${review.merchantName} 이미지`"
        @error="handleImageError"
      />
    </div>

    <div class="review-info">
      <div class="review-heading">
        <strong>{{ review.merchantName }}</strong>
        <span class="rating" :aria-label="`별점 ${review.rating}점`">
          <span>★</span> {{ Number(review.rating ?? 0).toFixed(1) }}
        </span>
      </div>
      <AtmosphereTagSelector v-if="review.atmosphere" :model-value="review.atmosphere" readonly />
      <p>{{ review.content }}</p>
      <div class="review-footer">
        <time :datetime="review.createdAt">{{ formatDate(review.createdAt) }}</time>
      </div>
    </div>
  </article>
</template>

<style scoped>
.review-card { width:100%; min-height:140px; cursor:pointer; }
.review-card:hover { border-color:#84b9ff; background:#f5f9ff; box-shadow:0 6px 18px rgb(48 135 237 / 10%); }
.review-card:focus-visible { outline:2px solid #3087ed; outline-offset:2px; }
.review-thumbnail { display:flex; width:116px; min-width:116px; max-width:116px; height:116px; min-height:116px; max-height:116px; flex:0 0 116px; align-items:center; justify-content:center; overflow:hidden; border-radius:var(--radius-chip); }
.review-thumbnail img { display:block; width:116px; min-width:116px; max-width:116px; height:116px; min-height:116px; max-height:116px; object-fit:cover; object-position:center; }
.review-info { display:flex; min-width:0; flex:1; flex-direction:column; }
.review-heading { display:flex; align-items:center; justify-content:space-between; gap:5px; }
.review-heading strong { overflow:hidden; color:#16233a; font-size:16px; font-weight:700; text-overflow:ellipsis; white-space:nowrap; }
.rating { flex:none; color:#172033; font-size:12px; font-weight:700; }
.rating span { color:#ff9500; }
.atmosphere-tags { margin-top:6px; }
.review-info > p { display:-webkit-box; overflow:hidden; margin:6px 0 3px; color:#3f5066; font-size:12px; line-height:1.55; white-space:pre-line; -webkit-box-orient:vertical; -webkit-line-clamp:2; }
.review-footer { display:flex; align-items:end; justify-content:space-between; gap:6px; margin-top:auto; }
time { margin-left:auto; color:#8493a7; font-size:12px; line-height:1; }
</style>
