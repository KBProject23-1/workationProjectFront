import { BedDouble, Building2, Flag, Utensils } from '@lucide/vue';

export const RECOMMENDATION_CATEGORIES = [
  {
    key: 'accommodations',
    type: 'ACCOMMODATION',
    title: '숙소',
    pageTitle: '숙소 추천',
    description: '워크라운지 제주에서\n가까운 숙소를 추천하고 있어요',
    referenceLabel: '워크라운지 제주',
    color: '#2684ff',
    background: '#eaf3ff',
    border: '#cfe2ff',
    icon: BedDouble,
    detailRoute: 'AccommodationDetail',
  },
  {
    key: 'offices',
    type: 'OFFICE',
    title: '공유오피스',
    pageTitle: '공유오피스 추천',
    description: '스테이 호텔에서\n가까운 공유오피스를 추천하고 있어요',
    referenceLabel: '스테이 호텔',
    color: '#25a563',
    background: '#edf8f2',
    border: '#d5ebdf',
    icon: Building2,
    detailRoute: 'OfficeDetail',
  },
  {
    key: 'restaurants',
    type: 'RESTAURANT',
    title: '음식점',
    pageTitle: '음식점 추천',
    description: '',
    referenceLabel: '자동',
    color: '#ff6418',
    background: '#fff4e9',
    border: '#ffdabb',
    icon: Utensils,
    detailRoute: 'RestaurantDetail',
  },
  {
    key: 'activities',
    type: 'ACTIVITY',
    title: '여가',
    pageTitle: '여가 추천',
    description: '',
    referenceLabel: '자동',
    color: '#7653f6',
    background: '#f3eeff',
    border: '#e1d5ff',
    icon: Flag,
    detailRoute: 'ActivityDetail',
  },
];

export const RECOMMENDATION_CATEGORY_MAP = Object.fromEntries(
  RECOMMENDATION_CATEGORIES.map((category) => [category.key, category]),
);

export const MEAL_TYPES = [
  { value: 'BREAKFAST', label: '아침' },
  { value: 'LUNCH', label: '점심' },
  { value: 'DINNER', label: '저녁' },
];

export const REFERENCE_PLACES = {
  accommodations: {
    defaultPlace: {
      merchantId: 201,
      name: '워크라운지 제주',
      type: 'AUTO_MERCHANT',
      description: '확정 예약된 공유오피스',
    },
    candidates: [
      { merchantId: 201, name: '워크라운지 제주', description: '제주시 연동' },
      {
        merchantId: 202,
        name: '제주 패스파인더',
        description: '제주시 노형동',
      },
      {
        merchantId: 203,
        name: '스페이스클라우드 제주',
        description: '제주시 이도동',
      },
      { merchantId: 204, name: '제주창조경제혁신센터', description: '제주시 중앙로' },
      { merchantId: 205, name: '오피스제주 사계점', description: '서귀포시 안덕면' },
      { merchantId: 206, name: '질그랭이 거점센터', description: '제주시 구좌읍' },
      { merchantId: 207, name: '워크앤스테이 제주', description: '제주시 애월읍' },
    ],
  },
  offices: {
    defaultPlace: {
      merchantId: 101,
      name: '스테이 호텔',
      type: 'AUTO_MERCHANT',
      description: '확정 예약된 숙소',
    },
    candidates: [
      { merchantId: 101, name: '스테이 호텔', description: '제주시 연동' },
      {
        merchantId: 102,
        name: '호텔 시리우스 제주',
        description: '제주시 도령로',
      },
      {
        merchantId: 103,
        name: '그랜드 하얏트 제주',
        description: '제주시 노연로',
      },
      { merchantId: 104, name: '메종 글래드 제주', description: '제주시 노연로' },
      { merchantId: 105, name: '롯데시티호텔 제주', description: '제주시 도령로' },
      { merchantId: 106, name: '라마다 프라자 제주', description: '제주시 탑동로' },
      { merchantId: 107, name: '신라스테이 제주', description: '제주시 노연로' },
    ],
  },
  restaurants: {
    defaults: {
      BREAKFAST: {
        merchantId: 101,
        name: '스테이 호텔',
        type: 'AUTO_MERCHANT',
        description: '아침은 숙소를 기준으로 추천',
      },
      LUNCH: {
        merchantId: 201,
        name: '워크라운지 제주',
        type: 'AUTO_MERCHANT',
        description: '점심은 공유오피스를 기준으로 추천',
      },
      DINNER: {
        merchantId: null,
        name: '숙소·공유오피스 중간 지점',
        type: 'AUTO_MIDPOINT',
        description: '저녁은 두 장소의 중간 좌표를 기준으로 추천',
      },
    },
    candidates: [
      { merchantId: 101, name: '스테이 호텔', description: '확정 예약 숙소' },
      {
        merchantId: 201,
        name: '워크라운지 제주',
        description: '확정 예약 공유오피스',
      },
      {
        merchantId: 301,
        name: '이호테우 해변',
        description: '제주시 이호일동',
      },
      { merchantId: 102, name: '호텔 시리우스 제주', description: '제주시 도령로' },
      { merchantId: 202, name: '제주 패스파인더', description: '제주시 노형동' },
      { merchantId: 302, name: '한라수목원', description: '제주시 수목원길' },
      { merchantId: 303, name: '도두봉', description: '제주시 도두일동' },
      { merchantId: 304, name: '용두암', description: '제주시 용두암길' },
    ],
  },
  activities: {
    defaultPlace: {
      merchantId: 101,
      name: '스테이 호텔',
      type: 'AUTO_MERCHANT',
      description: '확정 예약된 숙소',
    },
    candidates: [
      { merchantId: 101, name: '스테이 호텔', description: '제주시 연동' },
      {
        merchantId: 102,
        name: '호텔 시리우스 제주',
        description: '제주시 도령로',
      },
      {
        merchantId: 103,
        name: '그랜드 하얏트 제주',
        description: '제주시 노연로',
      },
      { merchantId: 104, name: '메종 글래드 제주', description: '제주시 노연로' },
      { merchantId: 105, name: '롯데시티호텔 제주', description: '제주시 도령로' },
      { merchantId: 106, name: '라마다 프라자 제주', description: '제주시 탑동로' },
      { merchantId: 107, name: '신라스테이 제주', description: '제주시 노연로' },
    ],
  },
};

export const MOCK_RECOMMENDATIONS = [
  {
    merchantId: 101,
    name: '스테이 호텔 강남',
    rating: 4.7,
    reviewCount: 312,
    price: 180000,
    address: '강남역',
    distance: '450m',
    imageUrl:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80',
  },
  {
    merchantId: 102,
    name: '호텔 더 디자이너스',
    rating: 4.6,
    reviewCount: 278,
    price: 165000,
    address: '신논현역',
    distance: '350m',
    imageUrl:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=300&q=80',
  },
  {
    merchantId: 103,
    name: 'L7 홍대 바이 롯데',
    rating: 4.5,
    reviewCount: 498,
    price: 155000,
    address: '홍대입구역',
    distance: '500m',
    imageUrl:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=300&q=80',
  },
  {
    merchantId: 104,
    name: '호텔 나루 서울',
    rating: 4.4,
    reviewCount: 186,
    price: 142000,
    address: '마포역',
    distance: '600m',
    imageUrl:
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=300&q=80',
  },
  {
    merchantId: 105,
    name: '글래드 여의도',
    rating: 4.3,
    reviewCount: 360,
    price: 135000,
    address: '여의도역',
    distance: '300m',
    imageUrl:
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=300&q=80',
  },
];
