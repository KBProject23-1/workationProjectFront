import { getMerchants } from '@/api/merchants';

// yyyy-MM-dd
const isoDate = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

const contentOf = (response) => response?.data?.content ?? [];

// 아직 워케이션이 없는 사람에게 보여줄 장소를 고른다.
//
// /merchants 는 카테고리를 비우면 전 업종을 함께 주지만 그때는 기간이 필수고,
// 숙소·오피스는 그 기간에 재고가 있는 곳만 통과한다.
// 시드에 재고가 없으면 목록이 통째로 빈다.
//
// 그래서 두 단계로 시도한다.
//   1) 오늘 하루 기준 전 업종
//   2) 비면 음식점·여가만. 이 둘은 재고가 없어 날짜 조건을 타지 않는다
export const fetchPopularPlaces = async ({ regionId, size = 10 } = {}) => {
  const base = { sort: 'RATING_DESC', size };
  if (regionId) base.regionId = regionId;

  try {
    const withDates = await getMerchants({
      ...base,
      startDate: isoDate(),
      endDate: isoDate(1),
    });
    const places = contentOf(withDates);
    if (places.length > 0) return places;
  } catch (error) {
    // 조회 실패는 화면을 막을 일이 아니지만, 원인은 남겨야 한다
    console.warn('[popularPlaces] 기간 조회 실패', error.message);
  }

  try {
    const [restaurants, activities] = await Promise.all([
      getMerchants({ ...base, category: 'RESTAURANT' }),
      getMerchants({ ...base, category: 'ACTIVITY' }),
    ]);
    return [...contentOf(restaurants), ...contentOf(activities)].slice(0, size);
  } catch (error) {
    console.warn('[popularPlaces] 업종 조회 실패', error.message);
    return [];
  }
};
