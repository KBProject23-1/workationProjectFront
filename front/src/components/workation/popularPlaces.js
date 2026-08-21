import { getMerchants } from '@/api/merchants';

// 서버 정렬은 평점 내림차순 하나뿐이라 그대로 쓰면 리뷰 한 건짜리 5.0 이 맨 앞에 온다.
// 넉넉히 받아 와서 프론트에서 다시 줄을 세운다. 요청 횟수는 그대로다
const FETCH_SIZE = 40;

// 업종을 돌아가며 뽑는 순서. 워케이션에서 예약하는 순서와 같다
const CATEGORY_ORDER = ['ACCOMMODATION', 'OFFICE', 'RESTAURANT', 'ACTIVITY'];

// 베이지안 평균의 기준 리뷰 수.
// 리뷰가 이 값보다 적으면 점수가 기준 평점 쪽으로 끌려간다
const REVIEW_BASELINE = 10;

// 리뷰가 없는 곳에 가정하는 평점.
//
// 받아온 목록의 평균을 쓰면 안 된다. 서버가 이미 평점 높은 순으로 주기 때문에
// 평균이 4.7 쯤으로 부풀어, 리뷰 한 건짜리를 끌어내리지 못한다.
// 실제 데이터 분포를 보고 조정하면 된다
const PRIOR_RATING = 4.0;

// yyyy-MM-dd
const isoDate = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

const contentOf = (response) => response?.data?.content ?? [];

const numberOf = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

// 리뷰 수를 반영한 평점.
//
//   점수 = (v / (v + m)) * 그 가게 평점 + (m / (v + m)) * 기준 평점
//
// 리뷰가 많을수록 자기 평점에 가까워지고, 적을수록 기준 평점으로 수렴한다.
// 리뷰 1건 5.0 이 리뷰 200건 4.5 를 이기는 문제를 막는다
const bayesianScore = (place) => {
  const reviews = numberOf(place.reviewCount);
  const rating = numberOf(place.rating);
  const weight = reviews / (reviews + REVIEW_BASELINE);
  return weight * rating + (1 - weight) * PRIOR_RATING;
};

// 업종별로 한 장씩 번갈아 뽑는다.
// 그냥 점수순으로 자르면 숙소만 세 장 뜨는 일이 생긴다
const roundRobin = (places, size) => {
  const buckets = new Map(CATEGORY_ORDER.map((category) => [category, []]));
  const others = [];

  places.forEach((place) => {
    const bucket = buckets.get(place.category);
    if (bucket) bucket.push(place);
    else others.push(place);
  });

  const picked = [];
  let round = 0;

  // 남은 업종이 없을 때까지 한 바퀴씩 돈다
  while (picked.length < size) {
    const before = picked.length;

    CATEGORY_ORDER.forEach((category) => {
      if (picked.length >= size) return;
      const place = buckets.get(category)[round];
      if (place) picked.push(place);
    });

    if (picked.length === before) break;
    round += 1;
  }

  // 업종이 하나뿐이라 자리가 남으면 나머지로 채운다
  return [...picked, ...others].slice(0, size);
};

const rank = (places, size) => {
  if (places.length === 0) return [];

  const scored = [...places].sort(
    (a, b) => bayesianScore(b) - bayesianScore(a),
  );

  return roundRobin(scored, size);
};

// 아직 워케이션이 없는 사람에게 보여줄 장소를 고른다.
//
// /merchants 는 카테고리를 비우면 전 업종을 함께 주지만 그때는 기간이 필수고,
// 숙소·오피스는 그 기간에 재고가 있는 곳만 통과한다.
//
// 그래서 두 단계로 시도한다.
//   1) 오늘 하루 기준 전 업종
//   2) 비면 음식점·여가만. 이 둘은 재고가 없어 날짜 조건을 타지 않는다
//
// 둘 다 실패하면 빈 배열을 준다. 화면은 안내 문구로 대신한다
export const fetchPopularPlaces = async ({ regionId, size = 10 } = {}) => {
  const base = { sort: 'RATING_DESC', size: FETCH_SIZE };
  if (regionId) base.regionId = regionId;

  try {
    const withDates = await getMerchants({
      ...base,
      startDate: isoDate(),
      endDate: isoDate(1),
    });
    const places = contentOf(withDates);
    if (places.length > 0) return rank(places, size);
  } catch {
    // 조회 실패는 화면을 막을 일이 아니지만, 원인은 남겨야 한다
  }

  // 하나가 실패해도 성공한 업종만이라도 보여준다
  const collect = (result) => {
    if (result.status === 'fulfilled') return contentOf(result.value);
    return [];
  };

  const [restaurants, activities] = await Promise.allSettled([
    getMerchants({ ...base, category: 'RESTAURANT' }),
    getMerchants({ ...base, category: 'ACTIVITY' }),
  ]);
  const places = [...collect(restaurants), ...collect(activities)];

  return rank(places, size);
};
