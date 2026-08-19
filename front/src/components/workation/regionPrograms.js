// 지자체 워케이션 지원 제도 정적 데이터.
//
// region 테이블에는 id 와 name 만 있어 이미지와 지원 제도는 프론트에서 들고 있다.
// region.name 을 키로 쓴다. id 는 환경마다 값이 달라질 수 있다.
//
// settlementType
//   AFTER   본인이 먼저 결제하고 증빙을 내면 나중에 환급받는다. 우리 앱 지출 내역이 그대로 증빙이 된다.
//   PARTNER 지정 플랫폼에서 예약해야 할인·지원이 붙는다. 앱 밖에서 예약하게 된다.
//
// 지원 조건과 금액은 지자체 공고에 따라 바뀐다. 화면에 안내 문구를 함께 노출한다.

import jejuCard from '@/assets/images/regions/jeju-card.webp';
import jejuHero from '@/assets/images/regions/jeju-hero.webp';
import gangneungCard from '@/assets/images/regions/gangneung-card.webp';
import gangneungHero from '@/assets/images/regions/gangneung-hero.webp';
import busanCard from '@/assets/images/regions/busan-card.webp';
import busanHero from '@/assets/images/regions/busan-hero.webp';
import yeosuCard from '@/assets/images/regions/yeosu-card.webp';
import yeosuHero from '@/assets/images/regions/yeosu-hero.webp';

export const SETTLEMENT_AFTER = 'AFTER';
export const SETTLEMENT_PARTNER = 'PARTNER';

const PROGRAMS = {
  제주: {
    key: 'jeju',
    // 화면에 부를 이름. region.name 은 '제주' 지만 문장에서는 '제주도' 가 자연스럽다
    displayName: '제주도',
    card: jejuCard,
    hero: jejuHero,
    tagline: '오래 머물수록 좋아지는 곳',
    settlementType: SETTLEMENT_AFTER,
    summary: [
      '섬 곳곳에 오피스와 숙소가 흩어져 있습니다.',
      '한 달 단위로 길게 잡기 좋습니다.',
      '결제 내역이 그대로 지원금 증빙이 됩니다.',
    ],
    highlights: [
      { label: '지원 한도', value: '1박 최대 5만원 · 총 30만원' },
      { label: '지급 방식', value: '사후 정산 (증빙 제출 후 환급)' },
      { label: '정산 기준', value: '숙박일이 아닌 오피스 이용일' },
    ],
    notes: [
      '먼저 본인 비용으로 결제하고, 이용을 마친 뒤 지출 증빙과 근무 기록을 제출합니다.',
      '숙박했더라도 그날 오피스 이용 기록이 없으면 해당 일자는 정산에서 빠집니다.',
      '지정 앱을 통한 출퇴근 기록이 필요합니다.',
    ],
    siteName: '제주워케이션',
    siteOwner: '제주특별자치도',
    linkLabel: '제주워케이션에서 상세보기',
    url: 'https://www.jeju.go.kr/workation/',
  },

  강릉: {
    key: 'gangneung',
    displayName: '강릉',
    card: gangneungCard,
    hero: gangneungHero,
    tagline: '기차로 두 시간, 바다 앞 작업실',
    settlementType: SETTLEMENT_PARTNER,
    summary: [
      'KTX 로 두 시간이면 닿습니다.',
      '바다와 붙은 숙소가 많습니다.',
      '결제만 WorkIt 으로 하면 지출이 나뉘어 쌓입니다.',
    ],
    highlights: [
      { label: '혜택', value: '주중 2박 이상 숙박 할인' },
      { label: '지급 방식', value: '제휴 플랫폼 예약 시 즉시 할인' },
      { label: '추가 혜택', value: '레저 상품 · 렌터카 할인' },
    ],
    notes: [
      '강릉은 강원도 워케이션 사업에 포함된 시군 중 하나입니다.',
      '제휴 플랫폼을 통해 예약해야 할인이 적용됩니다.',
      '인기 숙소는 조기에 마감되는 경우가 있습니다.',
    ],
    siteName: '강원 워케이션',
    siteOwner: '강원관광재단',
    linkLabel: '강원 워케이션에서 상세보기',
    url: 'https://worcation.co.kr/',
  },

  부산: {
    key: 'busan',
    displayName: '부산',
    card: busanCard,
    hero: busanHero,
    tagline: '도시 인프라를 그대로 쓰는 워케이션',
    settlementType: SETTLEMENT_PARTNER,
    summary: [
      '지하철로 다니는 도시형 워케이션입니다.',
      '공유오피스와 카페가 많습니다.',
      '업무공간이 무상이라 임차료 예산을 줄일 수 있습니다.',
    ],
    highlights: [
      { label: '지원 한도', value: '1박 5만원 · 1인 최대 50만원' },
      { label: '이용 기간', value: '최소 3박 ~ 최대 10박' },
      { label: '추가 혜택', value: '관광바우처 5만원 · 업무공간 무상' },
    ],
    notes: [
      '지정된 숙박 플랫폼을 통해 예약해야 지원을 받을 수 있습니다.',
      '신청할 때 사업자등록증과 재직증명서를 제출합니다.',
      '예약을 취소하거나 이용하지 않으면 지원금을 반납해야 할 수 있습니다.',
    ],
    siteName: '부산워케이션',
    siteOwner: '부산광역시',
    linkLabel: '부산워케이션에서 상세보기',
    url: 'https://www.busaness.com/',
  },

  여수: {
    key: 'yeosu',
    displayName: '여수',
    card: yeosuCard,
    hero: yeosuHero,
    tagline: '처음이라면 3박 4일부터',
    settlementType: SETTLEMENT_PARTNER,
    summary: [
      '1박 2일부터 신청할 수 있습니다.',
      '워케이션이 처음이라면 여기부터입니다.',
      '짧아도 예산과 지출은 그대로 기록됩니다.',
    ],
    highlights: [
      { label: '지원 한도', value: '1박당 최대 10만원' },
      { label: '이용 기간', value: '1박 2일 ~ 3박 4일' },
      { label: '추가 혜택', value: '지역 체험 프로그램 할인' },
    ],
    notes: [
      '여수는 전남 블루워케이션에 참여하는 시군 중 하나입니다.',
      '홈페이지에서 회원가입 후 사전 신청서를 제출합니다.',
      '재직증명서 또는 사업자등록증이 필요합니다.',
    ],
    siteName: '전남 블루워케이션',
    siteOwner: '전남관광재단',
    linkLabel: '전남 블루워케이션에서 상세보기',
    url: 'https://worcation.ijnto.or.kr/',
  },
};

// 카드에 노출할 순서. 시연을 제주로 하므로 제주가 맨 앞이다
const ORDER = ['제주', '강릉', '부산', '여수'];

// 지원 제도가 있는 지역만, 정해진 순서로 돌려준다.
// 목록에 없는 지역은 이미지가 없어 카드가 깨지므로 걸러낸다
export const orderedRegions = (regions) =>
  regions
    .filter((region) => Boolean(PROGRAMS[region.name]))
    .sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name));

export const DISCLAIMER =
  '지원 조건과 금액은 지자체 공고에 따라 달라질 수 있습니다. 신청 전 공식 사이트에서 확인해 주세요.';

export const programOf = (regionName) => PROGRAMS[regionName] ?? null;

// '제주도' + 로 / '강릉' + 으로.
// 받침이 있으면 '으로', 없거나 ㄹ 받침이면 '로' 를 붙인다
export const withRo = (name) => {
  if (!name) return '';
  const code = name.charCodeAt(name.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${name}으로`;

  const finalConsonant = code % 28;
  // 8 은 ㄹ
  return finalConsonant === 0 || finalConsonant === 8
    ? `${name}로`
    : `${name}으로`;
};
