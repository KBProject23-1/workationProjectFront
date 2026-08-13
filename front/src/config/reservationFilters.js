// 예약하기 화면의 예약 유형별 필터 값.
// ENUM 은 백엔드 테이블 정의를 그대로 따른다

export const RESERVATION_CATEGORIES = [
  { label: '숙소', value: 'ACCOMMODATION' },
  { label: '공유오피스', value: 'OFFICE' },
  { label: '음식점', value: 'RESTAURANT' },
  { label: '여가', value: 'ACTIVITY' },
];

// accommodations.accommodation_type
export const ACCOMMODATION_TYPES = [
  { label: '전체', value: '' },
  { label: '호텔', value: 'HOTEL' },
  { label: '펜션', value: 'PENSION' },
  { label: '리조트', value: 'RESORT' },
  { label: '게스트하우스', value: 'GUESTHOUSE' },
  { label: '풀빌라', value: 'POOL_VILLA' },
];

// offices.noise_level
export const OFFICE_NOISE_LEVELS = [
  { label: '전체', value: '' },
  { label: '조용한 공간', value: 'QUIET' },
  { label: '개방적인 공간', value: 'OPEN' },
  { label: '협업 공간', value: 'COLLAB' },
];

// restaurants.food_type
export const FOOD_TYPES = [
  { label: '전체', value: '' },
  { label: '한식', value: 'KOREAN' },
  { label: '일식', value: 'JAPANESE' },
  { label: '중식', value: 'CHINESE' },
  { label: '양식', value: 'WESTERN' },
  { label: '카페', value: 'CAFE' },
  { label: '디저트', value: 'DESSERT' },
  { label: '바', value: 'BAR' },
];

// restaurants.price_level. 고른 단계 이하를 모두 보여준다
export const PRICE_LEVELS = [
  { label: '전체', value: '' },
  { label: '저렴한 편', value: 1 },
  { label: '보통', value: 2 },
  { label: '비싼 편', value: 3 },
];

// activities.activity_type
export const ACTIVITY_TYPES = [
  { label: '전체', value: '' },
  { label: '해양', value: 'MARINE' },
  { label: '스포츠', value: 'SPORTS' },
  { label: '힐링', value: 'HEALING' },
  { label: '문화', value: 'CULTURE' },
  { label: '축제', value: 'FESTIVAL' },
  { label: '쇼핑', value: 'SHOPPING' },
  { label: '기타', value: 'ETC' },
];

// 음식점 추천은 mealType 이 필수다
export const MEAL_TYPES = [
  { label: '아침', value: 'BREAKFAST' },
  { label: '점심', value: 'LUNCH' },
  { label: '저녁', value: 'DINNER' },
];

// 찾는 방식.
// 검색은 내가 조건을 걸고, 추천은 워케이션 기간·예산·설문을 서버가 조건으로 쓴다.
// 조건을 정하는 주체가 달라 같은 필터를 공유할 수 없다
export const SEARCH_MODES = [
  { label: '내 조건으로 찾기', value: 'SEARCH' },
  { label: '추천 받기', value: 'RECOMMEND' },
];

export const SORT_OPTIONS = [
  { label: '평점 높은순', value: 'RATING_DESC' },
  { label: '가격 낮은순', value: 'PRICE_ASC' },
  { label: '가격 높은순', value: 'PRICE_DESC' },
];
