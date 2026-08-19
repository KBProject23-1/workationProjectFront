<template>
  <div>
    <div class="rounded-2xl bg-blue-50 px-5 py-8 text-center">
      <img
        :src="workitLogo"
        alt="WorkIt"
        class="mx-auto mb-4 h-12 w-auto"
      />

      <h2 class="text-lg font-bold text-slate-900">
        진행중인 워케이션이 없어요
      </h2>

      <p class="mt-2 text-sm text-slate-500">
        <template v-if="isReturning">
          다음 워케이션을 등록하면<br />
          지난 취향 그대로 추천해 드려요
        </template>
        <template v-else>
          일정을 등록하면 예산과 지출을<br />
          자동으로 관리해 드려요
        </template>
      </p>

      <BaseButton
        variant="default"
        class="mt-6 h-12 w-full rounded-xl text-base"
        @click="$emit('register')"
      >
        워케이션 등록하기
      </BaseButton>
    </div>

    <!-- 처음인 사용자에게만 흐름을 설명한다. 두 번째부터는 이미 안다 -->
    <template v-if="!isReturning">
      <h3 class="mt-6 mb-2 text-sm font-bold text-slate-900">
        워케이션은 이렇게 진행돼요
      </h3>
      <div class="rounded-xl border border-slate-200 px-4 py-4">
        <div
          v-for="step in STEPS"
          :key="step.no"
          class="mb-3.5 flex items-start gap-3 last:mb-0"
        >
          <span
            class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white"
          >
            {{ step.no }}
          </span>
          <span>
            <span class="block text-sm font-bold text-slate-900">
              {{ step.title }}
            </span>
            <span class="block text-xs text-slate-500">{{ step.body }}</span>
          </span>
        </div>
      </div>
    </template>

    <!-- 재방문 사용자에게는 지난 기록을 먼저 보여준다 -->
    <template v-if="isReturning">
      <h3 class="mt-6 mb-2 text-sm font-bold text-slate-900">지난 워케이션</h3>
      <div class="rounded-xl border border-slate-200 px-4 py-3">
        <div class="flex items-center justify-between gap-2">
          <button
            type="button"
            class="min-w-0 flex-1 truncate text-left text-sm font-bold text-slate-900"
            @click="$emit('record-detail', lastRecord.id)"
          >
            {{ lastRecord.title }} ›
          </button>
          <span
            class="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500"
          >
            정산완료
          </span>
        </div>

        <p class="mt-0.5 text-xs text-slate-400">
          {{ lastRecord.region?.name }} · {{ dotDate(lastRecord.startDate) }} ~
          {{ dotDate(lastRecord.endDate) }} ({{ lastRecordDays }}일)
        </p>

        <p
          class="mt-2.5 border-t border-slate-100 pt-2.5 text-right text-xs text-slate-400"
        >
          {{ workLabel }} {{ won(lastRecord.businessSpentTotal) }} / 개인
          {{ won(lastRecord.personalSpentTotal) }}
        </p>

        <button
          type="button"
          class="mt-2.5 w-full rounded-lg border border-blue-100 py-2.5 text-xs font-bold text-blue-500 transition-colors active:bg-blue-50"
          @click="$emit('records')"
        >
          지난 워케이션 모두 보기
        </button>
      </div>

      <template v-if="bookmarks.length > 0">
        <h3 class="mt-6 mb-2 text-sm font-bold text-slate-900">
          내가 찜한 장소
        </h3>
        <SwipeRow>
          <MerchantMiniCard
            v-for="bookmark in bookmarks"
            :key="bookmark.bookmarkId"
            :name="bookmark.name"
            :thumbnail-url="bookmark.thumbnailUrl"
            :rating="bookmark.rating"
            :price="bookmark.price"
          />
        </SwipeRow>
      </template>
    </template>

    <template v-if="regionCards.length > 0">
      <h3 class="mt-6 mb-2 text-sm font-bold text-slate-900">
        워케이션 지역 보기
      </h3>
      <SwipeRow>
        <RegionCard
          v-for="region in regionCards"
          :key="region.id"
          :name="region.name"
          :image="region.image"
          @select="$emit('region', region.id)"
        />
      </SwipeRow>
    </template>

    <!-- 처음인 사용자에게는 어떤 장소를 예약하게 되는지 미리 보여준다 -->
    <template v-if="!isReturning">
      <h3 class="mt-6 mb-2 text-sm font-bold text-slate-900">
        지금 인기 있는 곳
      </h3>

      <SwipeRow v-if="merchants.length > 0">
        <MerchantMiniCard
          v-for="merchant in merchants"
          :key="merchant.merchantId"
          :name="merchant.name"
          :thumbnail-url="merchant.thumbnailUrl"
          :rating="merchant.rating"
          :price="merchant.price"
        />
      </SwipeRow>

      <p
        v-else
        class="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400"
      >
        곧 추천 장소를 보여드릴게요
      </p>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import BaseButton from '@/components/common/BaseButton.vue';
import workitLogo from '@/assets/images/splash-logo.png';
import RegionCard from '@/components/workation/RegionCard.vue';
import MerchantMiniCard from '@/components/workation/MerchantMiniCard.vue';
import SwipeRow from '@/components/workation/SwipeRow.vue';
import { dotDate, won } from '@/components/workation/format';
import {
  orderedRegions,
  programOf,
} from '@/components/workation/regionPrograms';
import { useBudgetTypeLabel } from '@/composables/useBudgetTypeLabel';

const STEPS = [
  {
    no: 1,
    title: '일정과 예산 등록',
    body: '기간과 지역을 정하고 예산을 나눠요',
  },
  { no: 2, title: '취향 설문', body: '어떤 공간을 좋아하는지 알려주세요' },
  { no: 3, title: '일정 추천받기', body: '숙소부터 여가까지 순서대로 추천' },
];

const props = defineProps({
  regions: { type: Array, default: () => [] },
  merchants: { type: Array, default: () => [] },
  bookmarks: { type: Array, default: () => [] },
  // 가장 최근에 정산을 마친 워케이션. 없으면 처음 온 사용자로 본다
  lastRecord: { type: Object, default: null },
});

defineEmits(['register', 'region', 'records', 'record-detail']);

const { workLabel } = useBudgetTypeLabel();

const isReturning = computed(() => Boolean(props.lastRecord));

// 지원 제도 데이터가 있는 지역만 정해진 순서로 카드가 된다.
// 홈에서는 이름만 얹는다. 설명은 상세 화면에서 본다
const regionCards = computed(() =>
  orderedRegions(props.regions).map((region) => ({
    ...region,
    image: programOf(region.name).card,
  })),
);

const lastRecordDays = computed(() => {
  const record = props.lastRecord;
  if (!record?.startDate || !record?.endDate) return 0;
  const start = new Date(`${record.startDate}T00:00:00`);
  const end = new Date(`${record.endDate}T00:00:00`);
  return Math.round((end - start) / 86400000) + 1;
});
</script>
