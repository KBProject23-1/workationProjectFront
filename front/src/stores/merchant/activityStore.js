import { defineStore } from 'pinia';

const activityResponse = {
  status: 'SUCCESS',
  message: '요청 성공',
  data: [{
    merchantId: 20,
    merchantName: '서핑 체험 강릉',
    description: '무료 주차와 와이파이를 제공하며 반려동물 동반이 가능한 여가활동입니다.',
    thumbnailUrl: 'https://example.com/merchants/20.jpg',
    address: '강원특별자치도 강릉시 해안로 210',
    price: 50000,
    rating: 4.5,
    reviewCount: 120,
    reviews: [
      { nickname: '홍길동', created_at: '2026-08-06T12:00:00', rating: 4, content: '분위기가 좋고 접근성이 뛰어나 만족스러웠어요.', is_mine: true },
      { nickname: '여행자**', created_at: '2026-07-14T11:20:00', rating: 5, content: '강사님이 친절하고 초보자도 편하게 배울 수 있었어요.', is_mine: false },
      { nickname: '서퍼**', created_at: '2026-07-10T18:30:00', rating: 5, content: '파도 상태가 좋고 장비도 깨끗하게 관리되어 있어요.', is_mine: false },
      { nickname: '바다**', created_at: '2026-07-03T13:10:00', rating: 5, content: '사진 찍기에도 좋고 즐거운 추억을 만들었어요.', is_mine: false },
      { nickname: '강릉러**', created_at: '2026-06-28T09:40:00', rating: 4, content: '다음 강릉 여행에서도 다시 체험하고 싶어요.', is_mine: false },
    ],
    bookmarked: false,
  }],
};

export const useActivityStore = defineStore('activity', {
  state: () => ({ activity: activityResponse.data[0] }),
  actions: {
    toggleBookmark() {
      this.activity.bookmarked = !this.activity.bookmarked;
    },
  },
});
