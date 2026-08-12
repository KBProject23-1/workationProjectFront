<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { ChevronLeft, Heart, MapPin } from '@lucide/vue';
import MerchantReviewCard from '@/components/merchant/MerchantReviewCard.vue';
import { useActivityStore } from '@/stores/merchant/activityStore';

const activityStore = useActivityStore();
const route = useRoute();
const { activity, isLoading, error } = storeToRefs(activityStore);

async function fetchActivity() {
  await activityStore.fetchActivity(Number(route.params.merchantId));
}

onMounted(fetchActivity);
</script>

<template>
  <main class="activity-page">
    <header class="page-header">
      <button type="button" aria-label="뒤로 가기" @click="$router.back()"><ChevronLeft :size="32" /></button>
      <h1>여가 상세보기</h1>
      <span></span>
    </header>

    <p v-if="isLoading" class="status-message">여가 정보를 불러오고 있습니다.</p>
    <div v-else-if="error" class="status-message error">
      <p>{{ error }}</p>
      <button type="button" @click="fetchActivity">다시 시도</button>
    </div>

    <section class="hero-image" aria-label="여가활동 대표 이미지">
      <div class="activity-window"><i></i></div>
      <div class="surfer"></div>
      <div class="surfboard"></div>
    </section>

    <section class="activity-info">
      <button
        type="button"
        class="bookmark-button"
        :class="{ bookmarked: activity.bookmarked }"
        :aria-label="activity.bookmarked ? '북마크 해제' : '북마크 추가'"
        :aria-pressed="activity.bookmarked"
        @click="activityStore.toggleBookmark"
      >
        <Heart :size="18" :fill="activity.bookmarked ? 'currentColor' : 'none'" />
      </button>
      <h2>{{ activity.merchantName }}</h2>
      <p class="description">{{ activity.description }}</p>
      <p class="address"><MapPin :size="24" /> {{ activity.address }}</p>
      <div class="divider"></div>
      <p class="rating"><span>★</span> {{ activity.rating }}</p>
    </section>

    <section class="review-section">
      <div class="review-header">
        <h3>리뷰 <span>{{ activity.reviewCount }}개</span></h3>
        <button type="button" class="review-button" @click="$router.push(`/merchants/${activity.merchantId}/reviews`)">리뷰 보기</button>
      </div>
      <div class="review-list">
        <MerchantReviewCard v-for="review in activity.reviews" :key="`${review.nickname}-${review.created_at}`" :review="review" />
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css');
.activity-page { width:min(402px,100%); min-height:min(871px,100vh); margin:0 auto; padding-bottom:22px; color:#111827; background:#fff; font-family:'SUIT Variable','SUIT',sans-serif; } button { font:inherit; }
.status-message { padding:24px 16px; margin:0; text-align:center; color:#8a96a5; font-size:14px; }.status-message.error { color:#e05252; }.status-message.error p { margin:0 0 12px; }.status-message.error button { height:40px; padding:0 20px; color:#3087ed; border:1.5px solid #3087ed; border-radius:12px; background:#fff; font-weight:800; }
.page-header { height:118px; display:grid; grid-template-columns:40px 1fr 40px; align-items:end; padding:0 16px 14px; }.page-header button { width:36px; height:36px; display:grid; place-items:center; padding:0; border:0; background:none; }.page-header h1 { margin:0; text-align:center; font-size:22px; font-weight:800; }
.hero-image { position:relative; height:175px; margin:0 16px 16px; overflow:hidden; border-radius:22px; background:#b4d3fb; }.activity-window { position:absolute; top:27px; left:26px; right:26px; height:104px; overflow:hidden; border-radius:11px; background:#edf4fd; }.activity-window::after { content:''; position:absolute; left:-20px; right:-20px; bottom:-18px; height:65px; border-radius:50% 50% 0 0; background:#b6d3f5; }.activity-window i { position:absolute; top:12px; right:39px; z-index:1; width:24px; height:24px; border-radius:50%; background:#ffd057; }.surfer { position:absolute; left:102px; bottom:62px; z-index:2; width:73px; height:70px; border-radius:48% 48% 40% 40%; background:#c8c5c8; }.surfer::after { content:''; position:absolute; left:-30px; right:-8px; bottom:-8px; height:34px; border-radius:50% 50% 0 0; background:#5da0d2; }.surfboard { position:absolute; right:92px; bottom:69px; z-index:2; width:78px; height:7px; border-radius:8px; background:#3c83c8; transform:rotate(31deg); }.surfboard::after { content:''; position:absolute; left:54px; top:24px; width:53px; height:7px; border-radius:8px; background:#4d91d2; transform:rotate(-5deg); }
.activity-info { position:relative; margin:0 16px; padding:20px; border:1.5px solid #dbe3ee; border-radius:20px; background:#fff; }.bookmark-button { position:absolute; top:17px; right:18px; padding:0; color:#88a0bf; border:0; background:transparent; cursor:pointer; transition:color .16s ease,transform .16s ease; }.bookmark-button:hover { color:#3087ed; transform:scale(1.1); }.bookmark-button.bookmarked { color:#3087ed; }.activity-info h2 { margin:0 42px 8px 0; font-size:22px; }.description { margin:0 0 9px; color:#687587; font-size:12px; line-height:1.5; }.address { display:flex; align-items:center; gap:4px; margin:0; color:#8592a2; font-size:12px; }.divider { height:1px; margin:12px 0; background:#e3e8ee; }.rating { margin:0; font-size:16px; font-weight:800; }.rating span { color:#ff8a00; }
.review-section { padding:20px 12px 0; }.review-header { display:flex; align-items:center; justify-content:space-between; margin:0 4px 10px; }.review-section h3 { margin:0; font-size:16px; }.review-section h3 span { color:#7b8794; }.review-button { flex:none; padding:5px 10px; border:1px solid #3087ed; border-radius:999px; color:#3087ed; background:#fff; font-size:12px; font-weight:800; }.review-list { display:flex; flex-direction:column; gap:10px; padding:8px; border:1.5px solid #dbe3ee; border-radius:20px; background:#f8fbff; }
</style>
