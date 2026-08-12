<script setup>
import AtmosphereTagSelector from '@/components/review/AtmosphereTagSelector.vue';

defineProps({
  review: { type: Object, required: true },
});

const emit = defineEmits(['open']);

function formatDate(value) {
  return value.slice(0, 10).replaceAll('-', '.');
}
</script>

<template>
  <article class="review-card" role="link" tabindex="0" @click="emit('open', review.reviewId)" @keydown.enter="emit('open', review.reviewId)">
    <img v-if="review.imageUrl" class="review-image" :src="review.imageUrl" alt="사용자가 등록한 리뷰 사진" />
    <div v-else class="review-image review-image-empty" aria-label="등록된 리뷰 사진 없음"></div>

    <div class="review-info">
      <div class="review-heading">
        <strong>{{ review.merchantName }}</strong>
        <span class="stars" :aria-label="`별점 ${review.rating}점`">
          <span v-for="score in 5" :key="score" :class="{ empty: score > review.rating }">★</span>
        </span>
      </div>
      <AtmosphereTagSelector v-if="review.atmosphere" :model-value="review.atmosphere" readonly />
      <p>{{ review.content }}</p>
      <div class="review-footer">
        <time :datetime="review.createdAt">| {{ formatDate(review.createdAt) }}</time>
      </div>
    </div>
  </article>
</template>

<style scoped>
.review-card { width:100%; max-width:350px; min-height:130px; display:flex; gap:14px; padding:15px 12px 11px 16px; border:1.5px solid #dce6f2; border-radius:20px; background:#fff; cursor:pointer; }
.review-card:focus-visible { outline:2px solid #3087ed; outline-offset:2px; }
.review-image { width:94px; height:94px; flex:none; object-fit:cover; border-radius:7px; }
.review-image-empty { background:#e2e8f0; }
.review-info { min-width:0; flex:1; }
.review-heading { display:flex; align-items:center; justify-content:space-between; gap:5px; }
.review-heading strong { overflow:hidden; font-size:12px; font-weight:800; text-overflow:ellipsis; white-space:nowrap; }
.stars { display:flex; flex:none; color:#ff9500; font-size:16px; letter-spacing:0; }
.stars .empty { color:#b9c6d2; }
.atmosphere-tags { margin-top:6px; }
.review-info > p { margin:6px 0 3px; color:#3f5066; font-size:12px; line-height:1.55; white-space:pre-line; }
.review-footer { display:flex; align-items:end; justify-content:space-between; gap:6px; }
time { padding-bottom:5px; color:#8493a7; font-size:12px; }
</style>
