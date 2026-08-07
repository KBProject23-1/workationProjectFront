<script setup>
import { ref } from 'vue';
import { Heart } from '@lucide/vue';

const props = defineProps({
  merchant: { type: Object, required: true },
});

const isBookmarked = ref(props.merchant.bookmarked);
</script>

<template>
  <article class="result-card">
    <div class="result-image" :class="merchant.category.toLowerCase()">
      <span>{{ merchant.category === 'ACCOMMODATION' ? '🛏️' : '💻' }}</span>
    </div>
    <div class="result-content">
      <button
        type="button"
        class="bookmark-button"
        :aria-label="isBookmarked ? '북마크 해제' : '북마크 추가'"
        :aria-pressed="isBookmarked"
        @click="isBookmarked = !isBookmarked"
      >
        <Heart :size="29" :fill="isBookmarked ? '#3087ed' : 'none'" />
      </button>
      <h3>{{ merchant.name }}</h3>
      <p class="address">{{ merchant.address }}</p>
      <p class="rating"><span>★</span> {{ merchant.rating }} <b>({{ merchant.reviewCount }})</b> · 리뷰 {{ merchant.reviewCount }}개</p>
      <p class="benefit">예약 하루 전까지 무료 취소</p>
      <p class="price"><strong>{{ merchant.price.toLocaleString() }}원</strong> / {{ merchant.category === 'ACCOMMODATION' ? '1박' : '1일' }}</p>
    </div>
  </article>
</template>

<style scoped>
.result-card { display:flex; gap:16px; min-height:156px; padding:12px; border:1.5px solid #dbe3ee; border-radius:20px; background:#fff; }
.result-image { width:116px; flex:none; border-radius:16px; display:grid; place-items:center; font-size:40px; }
.result-image.accommodation { background:#ddebff; }.result-image.office { background:#e7f5ef; }
.result-content { position:relative; min-width:0; flex:1; padding:2px 2px 0 0; }
.bookmark-button { position:absolute; top:0; right:0; color:#526274; background:none; border:0; cursor:pointer; padding:0; }
h3 { margin:0 38px 7px 0; font-size:16px; line-height:1.25; color:#111827; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
p { margin:0; }
.address { color:#8a96a5; font-size:12px; margin-bottom:8px; }
.rating { color:#273445; font-size:12px; font-weight:700; }
.rating span { color:#ff8a00; }
.rating b { color:#7b8794; }
.benefit { margin-top:7px; color:#08a7a0; font-size:12px; font-weight:650; }
.price { margin-top:7px; text-align:right; color:#687587; font-size:12px; }
.price strong { color:#111827; font-size:22px; }
</style>
