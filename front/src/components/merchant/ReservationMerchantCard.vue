<script setup>
import { ref } from 'vue';
import { Heart } from '@lucide/vue';

const imageLoadFailed = ref(false);

defineProps({
  merchant: { type: Object, required: true },
});

defineEmits(['select', 'toggle-bookmark']);
</script>

<template>
  <article
    class="result-card"
    role="link"
    tabindex="0"
    :aria-label="`${merchant.name} 상세보기`"
    @click="$emit('select', merchant)"
    @keydown.enter="$emit('select', merchant)"
    @keydown.space.prevent="$emit('select', merchant)"
  >
    <div class="result-image" :class="merchant.category.toLowerCase()">
      <img
        v-if="merchant.thumbnailUrl && !imageLoadFailed"
        :src="merchant.thumbnailUrl"
        :alt="`${merchant.name} 대표 이미지`"
        @error="imageLoadFailed = true"
      />
      <span v-else class="image-placeholder">이미지 없음</span>
    </div>
    <div class="result-content">
      <button
        type="button"
        class="bookmark-button"
        :class="{ bookmarked: merchant.bookmarked }"
        :aria-label="merchant.bookmarked ? '북마크 해제' : '북마크 추가'"
        :aria-pressed="merchant.bookmarked"
        @click.stop="$emit('toggle-bookmark', merchant.merchantId)"
        @keydown.stop
      >
        <Heart :size="18" :fill="merchant.bookmarked ? 'currentColor' : 'none'" />
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
.result-card { display:flex; gap:16px; box-sizing:border-box; height:156px; padding:12px; overflow:hidden; border:1.5px solid #dbe3ee; border-radius:20px; background:#fff; cursor:pointer; }
.result-card:focus-visible { outline:2px solid #3087ed; outline-offset:2px; }
.result-image { width:116px; height:100%; flex:none; border-radius:16px; display:grid; place-items:center; }
.result-image { overflow:hidden; }.result-image img { width:100%; height:100%; object-fit:cover; }
.image-placeholder { color:#7b8794; font-size:12px; font-weight:700; }
.result-image.accommodation { background:#ddebff; }.result-image.office { background:#e7f5ef; }
.result-content { position:relative; min-width:0; flex:1; padding:2px 2px 0 0; }
.bookmark-button { position:absolute; top:0; right:0; padding:0; color:#88a0bf; border:0; background:transparent; cursor:pointer; transition:color .16s ease,transform .16s ease; }
.bookmark-button:hover { color:#3087ed; transform:scale(1.1); }
.bookmark-button.bookmarked { color:#3087ed; }
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
