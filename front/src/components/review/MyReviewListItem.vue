<script setup>
import AtmosphereTagSelector from '@/components/review/AtmosphereTagSelector.vue';

defineProps({
  review: { type: Object, required: true },
});

const emit = defineEmits(['modify', 'remove']);

function formatDate(value) {
  return value.slice(0, 10).replaceAll('-', '.');
}
</script>

<template>
  <article class="review-card">
    <div class="room-image" role="img" aria-label="호텔 객실 리뷰 사진">
      <span class="wall"></span><span class="window"></span>
      <span class="bed"></span><span class="lamp"></span>
    </div>

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
        <div class="actions">
          <button type="button" @click="emit('modify', review.reviewId)">수정</button>
          <button type="button" @click="emit('remove', review.reviewId)">삭제</button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.review-card { width:100%; max-width:350px; min-height:130px; display:flex; gap:14px; padding:15px 12px 11px 16px; border:1.5px solid #dce6f2; border-radius:20px; background:#fff; }
.room-image { position:relative; width:94px; height:94px; flex:none; overflow:hidden; border-radius:7px; background:#b99573; }
.wall { position:absolute; inset:0 0 45%; background:linear-gradient(125deg,#4b4239 0 36%,#d6d4ce 36% 52%,#b7c5cd 52% 100%); }
.window { position:absolute; top:10%; right:4%; width:43%; height:39%; border:3px solid #332f2b; background:linear-gradient(145deg,#9eb8c4,#dbe3e5); }
.bed { position:absolute; left:13%; bottom:12%; width:68%; height:34%; border:5px solid #f7f3ed; border-radius:3px; background:#e8e0d6; transform:skewX(-7deg); }
.bed::before { content:''; position:absolute; left:8%; top:-13px; width:31%; height:12px; border-radius:3px; background:#fff; }
.lamp { position:absolute; right:5%; bottom:12%; width:12%; height:26%; background:#594838; }
.review-info { min-width:0; flex:1; }
.review-heading { display:flex; align-items:center; justify-content:space-between; gap:5px; }
.review-heading strong { overflow:hidden; font-size:12px; font-weight:800; text-overflow:ellipsis; white-space:nowrap; }
.stars { display:flex; flex:none; color:#ff9500; font-size:16px; letter-spacing:0; }
.stars .empty { color:#b9c6d2; }
.atmosphere-tags { margin-top:6px; }
.review-info > p { margin:6px 0 3px; color:#3f5066; font-size:12px; line-height:1.55; white-space:pre-line; }
.review-footer { display:flex; align-items:end; justify-content:space-between; gap:6px; }
time { padding-bottom:5px; color:#8493a7; font-size:12px; }
.actions { display:flex; gap:6px; }
.actions button { width:44px; height:32px; padding:0; color:#3087ed; border:1.5px solid #3087ed; border-radius:17px; background:#fff; font-size:12px; cursor:pointer; opacity:1; }
.actions button:disabled { cursor:default; }
</style>
