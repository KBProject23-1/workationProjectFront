<script setup>
import { ref } from 'vue';
import { ChevronLeft, Heart, MapPin } from '@lucide/vue';
import MerchantReviewCard from '@/components/merchant/MerchantReviewCard.vue';

const restaurantResponse = {
  status: 'SUCCESS',
  message: '요청 성공',
  data: [
    {
      merchantId: 20,
      merchantName: '추천 장소',
      description: '무료 주차와 와이파이를 제공하며 반려동물 동반이 가능한 식당입니다.',
      thumbnailUrl: 'https://example.com/merchants/20.jpg',
      address: '강원특별자치도 강릉시 창해로 88',
      price: 50000,
      rating: 4.5,
      reviewCount: 120,
      reviews: [
        { nickname: '홍길동', created_at: '2026-08-06T12:00:00', rating: 4, content: '분위기가 좋고 접근성이 뛰어나 만족스러웠어요.', is_mine: true },
        { nickname: '여행자**', created_at: '2026-07-14T11:20:00', rating: 5, content: '음식이 맛있고 직원분들도 정말 친절했어요.', is_mine: false },
        { nickname: '서퍼**', created_at: '2026-07-10T18:30:00', rating: 5, content: '초보자도 편하게 즐길 수 있는 분위기였어요.', is_mine: false },
        { nickname: '바다**', created_at: '2026-07-03T13:10:00', rating: 5, content: '매장이 깔끔하고 사진 찍기에도 정말 좋았어요.', is_mine: false },
        { nickname: '강릉러**', created_at: '2026-06-28T09:40:00', rating: 4, content: '다음 강릉 여행에서도 다시 방문하고 싶어요.', is_mine: false },
      ],
      bookmarked: false,
    },
  ],
};

const restaurant = restaurantResponse.data[0];
const isBookmarked = ref(restaurant.bookmarked);
</script>

<template>
  <main class="restaurant-page">
    <header class="page-header">
      <button type="button" aria-label="뒤로 가기" @click="$router.back()"><ChevronLeft :size="32" /></button>
      <h1>음식점 상세보기</h1>
      <span></span>
    </header>

    <section class="hero-image" aria-label="음식점 대표 이미지">
      <div class="restaurant-window"><i></i></div>
      <div class="pasta"><span></span><b></b><em></em></div>
      <div class="table-item"></div>
    </section>

    <section class="restaurant-info">
      <button
        type="button"
        class="bookmark-button"
        :aria-label="isBookmarked ? '북마크 해제' : '북마크 추가'"
        :aria-pressed="isBookmarked"
        @click="isBookmarked = !isBookmarked"
      >
        <Heart :size="31" :fill="isBookmarked ? '#3087ed' : 'none'" />
      </button>
      <h2>{{ restaurant.merchantName }}</h2>
      <p class="description">{{ restaurant.description }}</p>
      <p class="address"><MapPin :size="24" /> {{ restaurant.address }}</p>
      <div class="divider"></div>
      <p class="rating"><span>★</span> {{ restaurant.rating }}</p>
      <div class="price"><span>예상 가격</span><strong>{{ restaurant.price.toLocaleString() }}원</strong></div>
    </section>

    <section class="review-section">
      <div class="review-header">
        <h3>리뷰 <span>{{ restaurant.reviewCount }}개</span></h3>
        <button type="button" class="review-button">리뷰 보기</button>
      </div>
      <div class="review-list">
        <MerchantReviewCard v-for="review in restaurant.reviews" :key="`${review.nickname}-${review.created_at}`" :review="review" />
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css');
.restaurant-page { width:min(402px,100%); min-height:min(871px,100vh); margin:0 auto; padding-bottom:22px; color:#111827; background:#fff; font-family:'SUIT Variable','SUIT',sans-serif; } button { font:inherit; }
.page-header { height:118px; display:grid; grid-template-columns:40px 1fr 40px; align-items:end; padding:0 16px 14px; }.page-header button { width:36px; height:36px; display:grid; place-items:center; padding:0; border:0; background:none; }.page-header h1 { margin:0; text-align:center; font-size:22px; font-weight:800; }
.hero-image { position:relative; height:175px; margin:0 16px 16px; overflow:hidden; border-radius:22px; background:#b4d3fb; }.restaurant-window { position:absolute; top:27px; left:26px; right:26px; height:104px; overflow:hidden; border-radius:11px; background:#edf4fd; }.restaurant-window::after { content:''; position:absolute; left:-15px; right:-15px; bottom:-14px; height:55px; border-radius:50% 50% 0 0; background:#b6d3f5; }.restaurant-window i { position:absolute; top:12px; right:39px; z-index:1; width:24px; height:24px; border-radius:50%; background:#ffd057; }.pasta { position:absolute; left:65px; bottom:64px; z-index:2; width:100px; height:35px; border:5px solid #df9854; border-radius:50%; background:#e7a654; }.pasta span,.pasta b,.pasta em { position:absolute; width:8px; height:8px; border-radius:50%; }.pasta span { top:7px; left:21px; background:#77ae67; }.pasta b { top:13px; left:45px; background:#e95d54; }.pasta em { top:4px; right:20px; background:#69ae67; }.table-item { position:absolute; right:106px; bottom:72px; width:58px; height:33px; border:9px solid #88776d; border-radius:7px; background:#e7ddd1; }
.restaurant-info { position:relative; margin:0 16px; padding:20px; border:1.5px solid #dbe3ee; border-radius:20px; background:#fff; }.bookmark-button { position:absolute; top:17px; right:18px; padding:0; color:#3087ed; border:0; background:none; }.restaurant-info h2 { margin:0 42px 8px 0; font-size:22px; }.description { margin:0 0 9px; color:#687587; font-size:12px; line-height:1.5; }.address { display:flex; align-items:center; gap:4px; margin:0; color:#8592a2; font-size:12px; }.divider { height:1px; margin:12px 0; background:#e3e8ee; }.rating { margin:0; font-size:16px; font-weight:800; }.rating span { color:#ff8a00; }.price { height:32px; display:flex; align-items:center; justify-content:space-between; margin-top:12px; padding:0 16px; border:1px solid #e4e9ef; border-radius:999px; background:#f8fafc; }.price span { color:#7b8794; font-size:12px; }.price strong { font-size:16px; }
.review-section { padding:20px 12px 0; }.review-header { display:flex; align-items:center; justify-content:space-between; margin:0 4px 10px; }.review-section h3 { margin:0; font-size:16px; }.review-section h3 span { color:#7b8794; }.review-button { flex:none; padding:5px 10px; border:1px solid #3087ed; border-radius:999px; color:#3087ed; background:#fff; font-size:12px; font-weight:800; }.review-list { display:flex; flex-direction:column; gap:10px; padding:8px; border:1.5px solid #dbe3ee; border-radius:20px; background:#f8fbff; }
</style>
