<template>
  <div>
    <!-- 헤더 그라데이션 위로 올라오는 카드 -->
    <div class="rounded-sheet bg-surface p-[18px] shadow-card">
      <div class="flex items-center gap-3">
        <span
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-brand-weak"
        >
          <img :src="workitLogo" alt="" class="h-6 w-auto" />
        </span>

        <span>
          <span class="block text-body font-semibold -tracking-[0.01em] text-ink">
            아직 등록한 워케이션이 없어요
          </span>
          <span class="mt-0.5 block text-body-sm text-ink-sub">
            {{
              isReturning
                ? '지난 취향 그대로 추천해 드릴게요'
                : '취향에 맞는 일정을 짜드릴게요'
            }}
          </span>
        </span>
      </div>

      <BaseButton
        variant="default"
        class="mt-4 w-full gap-1.5"
        @click="$emit('register')"
      >
        워케이션 시작하기
        <ArrowRight :size="18" />
      </BaseButton>
    </div>

    <!-- 처음인 사용자에게만 흐름을 설명한다. 두 번째부터는 이미 안다 -->
    <template v-if="!isReturning">
      <h3 class="text-title mt-6 mb-3 font-bold -tracking-[0.01em] text-ink">
        이렇게 진행돼요
      </h3>
      <div class="rounded-card bg-surface shadow-card px-[18px] py-1.5">
        <div
          v-for="step in STEPS"
          :key="step.no"
          class="border-line flex gap-3.5 border-b py-[15px] last:border-b-0"
        >
          <span
            class="text-body-sm bg-brand-weak text-brand flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[9px] font-bold"
          >
            {{ step.no }}
          </span>
          <span>
            <span class="text-body block font-semibold text-ink">
              {{ step.title }}
            </span>
            <span class="text-body-sm mt-0.5 block text-ink-mute">
              {{ step.body }}
            </span>
          </span>
        </div>
      </div>
    </template>

    <!-- 재방문 사용자에게는 지난 기록을 먼저 보여준다 -->
    <template v-if="isReturning">
      <h3 class="text-title mt-6 mb-3 px-0.5 font-bold -tracking-[0.01em] text-ink">
        지난 워케이션
      </h3>
      <div class="rounded-card bg-surface shadow-card px-[18px] py-4">
        <div class="flex items-center justify-between gap-2">
          <button
            type="button"
            class="text-body min-w-0 flex-1 truncate text-left font-semibold text-ink"
            @click="$emit('record-detail', lastRecord.id)"
          >
            {{ lastRecord.title }} ›
          </button>
          <span
            class="text-caption bg-canvas shrink-0 rounded-full px-2.5 py-1 font-bold text-ink-mute"
          >
            정산완료
          </span>
        </div>

        <p class="text-body-sm mt-1 text-ink-mute">
          {{ lastRecord.region?.name }} · {{ dotDate(lastRecord.startDate) }} ~
          {{ dotDate(lastRecord.endDate) }} ({{ lastRecordDays }}일)
        </p>

        <p
          class="text-body-sm border-line mt-3 border-t pt-3 text-right text-ink-sub"
        >
          {{ workLabel }} {{ won(lastRecord.businessSpentTotal) }} / 개인
          {{ won(lastRecord.personalSpentTotal) }}
        </p>

        <button
          type="button"
          class="text-body-sm bg-brand-weak text-brand mt-3 w-full rounded-chip py-3 font-bold transition-colors active:brightness-95"
          @click="$emit('records')"
        >
          지난 워케이션 모두 보기
        </button>
      </div>

      <template v-if="bookmarks.length > 0">
        <h3 class="text-title mt-6 mb-3 px-0.5 font-bold -tracking-[0.01em] text-ink">
          내가 찜한 장소
        </h3>
        <SwipeRow>
          <MerchantMiniCard
            v-for="bookmark in bookmarks"
            :key="bookmark.bookmarkId"
            :name="bookmark.name"
            :thumbnail-url="bookmark.thumbnailUrl"
            :category="bookmark.category"
            :rating="bookmark.rating"
            :price="bookmark.price"
            clickable
            @select="$emit('merchant', bookmark)"
          />
        </SwipeRow>
      </template>
    </template>

    <template v-if="regionCards.length > 0">
      <div class="mt-6 mb-3 flex items-baseline justify-between px-0.5">
        <h3 class="text-title font-bold -tracking-[0.01em] text-ink">
          워케이션 지역
        </h3>
        <span class="text-body-sm text-ink-mute">
          전체 {{ regionCards.length }}곳
        </span>
      </div>
      <SwipeRow>
        <RegionCard
          v-for="region in regionCards"
          :key="region.id"
          :name="region.displayName"
          :image="region.image"
          :caption="region.caption"
          @select="$emit('region', region.id)"
        />
      </SwipeRow>
    </template>

    <!-- 처음인 사용자에게는 어떤 장소를 예약하게 되는지 미리 보여준다 -->
    <template v-if="!isReturning">
      <h3 class="text-title mt-6 mb-3 px-0.5 font-bold -tracking-[0.01em] text-ink">
        지금 인기 있는 곳
      </h3>

      <SwipeRow v-if="merchants.length > 0">
        <MerchantMiniCard
          v-for="merchant in merchants"
          :key="merchant.merchantId"
          :name="merchant.name"
          :thumbnail-url="merchant.thumbnailUrl"
          :category="merchant.category"
          :rating="merchant.rating"
          :price="merchant.price"
          clickable
          @select="$emit('merchant', merchant)"
        />
      </SwipeRow>

      <p
        v-else
        class="rounded-card border-line text-body-sm text-ink-mute border border-dashed py-7 text-center"
      >
        곧 추천 장소를 보여드릴게요
      </p>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ArrowRight } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import workitLogo from '@/assets/images/splash-logo.png';
import RegionCard from '@/components/workation/RegionCard.vue';
import MerchantMiniCard from '@/components/workation/MerchantMiniCard.vue';
import SwipeRow from '@/components/workation/SwipeRow.vue';
import { dotDate, won, daysBetween } from '@/components/workation/format';
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

defineEmits(['register', 'region', 'records', 'record-detail', 'merchant']);

const { workLabel } = useBudgetTypeLabel();

const isReturning = computed(() => Boolean(props.lastRecord));

// 지원 제도 데이터가 있는 지역만 정해진 순서로 카드가 된다.
//
// 카드에는 지역 특징만 쓴다.
// 지자체 지원금은 우리가 제공하는 것이 아니라 여기서 내세울 값이 아니다.
// 지원 방식과 한도는 상세 화면에서 출처와 함께 본다
const regionCards = computed(() =>
  orderedRegions(props.regions).map((region) => {
    const program = programOf(region.name);
    return {
      ...region,
      displayName: program.displayName,
      image: program.card,
      caption: program.tagline,
    };
  }),
);

const lastRecordDays = computed(() =>
  daysBetween(props.lastRecord?.startDate, props.lastRecord?.endDate),
);
</script>
