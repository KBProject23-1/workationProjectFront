<script setup>
import AtmosphereTagSelector from '@/components/review/AtmosphereTagSelector.vue';

defineProps({
  review: { type: Object, required: true },
});
const emit = defineEmits(['open']);

function formatDate(value) {
  return value.slice(0, 10).replaceAll('-', '. ');
}
</script>

<template>
  <article class="review-item" role="link" tabindex="0" @click="emit('open', review.reviewId)" @keydown.enter="emit('open', review.reviewId)">
    <img v-if="review.imageUrl" class="review-thumbnail" :src="review.imageUrl" alt="리뷰 사진" />
    <div v-else class="review-thumbnail" aria-hidden="true">
      <span class="sun"></span>
      <span class="head"></span>
      <span class="wave wave-back"></span>
      <span class="wave wave-front"></span>
      <span class="board board-top"></span>
      <span class="board board-bottom"></span>
    </div>

    <div class="review-body">
      <div class="review-meta">
        <strong>{{ review.nickname }}</strong>
        <span class="stars" :aria-label="`별점 ${review.rating}점`">
          <span v-for="score in review.rating" :key="score">★</span>
        </span>
      </div>
      <time :datetime="review.createdAt">{{ formatDate(review.createdAt) }}</time>
      <AtmosphereTagSelector v-if="review.atmosphere" :model-value="review.atmosphere" readonly />
      <p>{{ review.content }}</p>
    </div>
  </article>
</template>

<style scoped>
.review-item { width:100%; max-width:350px; min-height:130px; display:flex; gap:14px; padding:15px 12px 11px 16px; border:1.5px solid #dce6f2; border-radius:20px; background:#fff; cursor:pointer; }
.review-thumbnail { position:relative; width:94px; height:94px; flex:none; overflow:hidden; object-fit:cover; border-radius:7px; background:#dbeaff; }
.sun { position:absolute; top:11px; right:4px; width:18px; height:18px; border-radius:50%; background:#ffd052; }
.head { position:absolute; top:13px; right:18px; width:24px; height:24px; border-radius:50%; background:#d9d5df; }
.wave { position:absolute; display:block; border-radius:50% 50% 0 0; }
.wave-back { left:11px; right:-18px; bottom:0; height:47px; background:#9fc5ef; }
.wave-front { left:21px; right:-12px; bottom:0; height:33px; background:#5b9bd3; }
.board { position:absolute; right:6px; z-index:2; width:56px; height:4px; border-radius:4px; background:#347fc5; transform-origin:right center; }
.board-top { top:50px; transform:rotate(27deg); }
.board-bottom { top:62px; transform:rotate(35deg); }
.review-body { min-width:0; flex:1; color:#334155; }
.review-meta { display:flex; align-items:center; justify-content:space-between; gap:5px; }
.review-meta strong { overflow:hidden; font-size:12px; font-weight:800; text-overflow:ellipsis; white-space:nowrap; }
.stars { display:flex; flex:none; color:#ff9500; font-size:16px; line-height:1; letter-spacing:0; }
time { display:block; margin-top:7px; color:#8493a7; font-size:12px; }
.atmosphere-tags { margin-top:7px; }
p { margin:6px 0 0; color:#3f5066; font-size:12px; line-height:1.55; white-space:pre-line; }
</style>
