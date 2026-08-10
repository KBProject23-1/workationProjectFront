import { defineStore } from 'pinia';

const restaurantResponse = {
  status: 'SUCCESS',
  message: '요청 성공',
  data: [{
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
  }],
};

export const useRestaurantStore = defineStore('restaurant', {
  state: () => ({ restaurant: restaurantResponse.data[0] }),
  actions: {
    toggleBookmark() {
      this.restaurant.bookmarked = !this.restaurant.bookmarked;
    },
  },
});
