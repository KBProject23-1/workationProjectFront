<template>
  <div class="min-h-screen bg-white pb-8">
    <div class="px-5 pt-4">
      <BaseHeader :title="displayName" @back="goBack" />
    </div>

    <LoadingScreen
      v-if="loading"
      title="지역 정보를 불러오고 있어요"
      :fullscreen="false"
    />

    <template v-else-if="program">
      <div class="relative mt-3 h-[190px]">
        <img
          :src="program.hero"
          :alt="`${regionName} 대표 이미지`"
          class="h-full w-full object-cover"
        />
        <span
          class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        />
        <div class="absolute bottom-0 left-0 px-5 pb-4">
          <p class="text-[22px] font-bold text-white">{{ displayName }}</p>
          <p class="mt-0.5 text-xs text-white/85">{{ program.tagline }}</p>
        </div>
      </div>

      <div class="px-5">
        <div class="mt-5 flex items-center gap-2">
          <span
            class="rounded-md px-2.5 py-1 text-[11px] font-bold"
            :class="
              isAfterSettlement
                ? 'bg-blue-50 text-blue-600'
                : 'bg-slate-100 text-slate-500'
            "
          >
            {{ isAfterSettlement ? '사후 정산' : '제휴 예약' }}
          </span>
          <span class="text-[11px] text-slate-400">
            {{ program.siteOwner }}
          </span>
        </div>

        <!-- 한 덩어리로 두면 읽기 힘들다. 짧은 문장으로 끊어 한 줄씩 놓는다 -->
        <ul class="mt-3 space-y-1">
          <li
            v-for="line in program.summary"
            :key="line"
            class="text-sm text-slate-600"
          >
            {{ line }}
          </li>
        </ul>

        <div class="mt-4 rounded-xl border border-slate-200 px-4 py-3">
          <div
            v-for="item in program.highlights"
            :key="item.label"
            class="mb-2.5 flex items-start justify-between gap-3 last:mb-0"
          >
            <span class="shrink-0 text-xs text-slate-400">
              {{ item.label }}
            </span>
            <span class="text-right text-xs font-bold text-slate-900">
              {{ item.value }}
            </span>
          </div>
        </div>

        <h2 class="mt-6 mb-2 text-sm font-bold text-slate-900">
          {{ displayName }}에서 인기 있는 곳
        </h2>

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

        <h2 class="mt-6 mb-2 text-sm font-bold text-slate-900">
          알아두면 좋아요
        </h2>
        <ul class="space-y-1.5">
          <li
            v-for="note in program.notes"
            :key="note"
            class="flex gap-2 text-xs leading-relaxed text-slate-500"
          >
            <span class="shrink-0 text-slate-300">·</span>
            <span>{{ note }}</span>
          </li>
        </ul>

        <!--
          사후 정산은 본인이 먼저 결제하고 증빙을 낸다.
          그 증빙이 우리 지출 내역이라 앱을 쓸 이유가 여기서 생긴다
        -->
        <div
          v-if="isAfterSettlement"
          class="mt-5 rounded-xl bg-blue-50 px-4 py-3.5"
        >
          <p class="text-xs font-bold text-blue-700">
            WorkIt 으로 결제하면 증빙이 쌓여요
          </p>
          <p class="mt-1 text-xs leading-relaxed text-blue-600/80">
            지출이 업종별로 자동 분류되고 법인과 개인이 나뉘어 기록됩니다. 정산
            내역서를 그대로 내려받아 제출할 수 있어요.
          </p>
        </div>

        <a
          :href="program.url"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-5 flex h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600"
        >
          {{ program.linkLabel }}
          <ExternalLink class="h-4 w-4" />
        </a>

        <p class="mt-2.5 text-[11px] leading-relaxed text-slate-400">
          {{ DISCLAIMER }}
        </p>

        <BaseButton
          variant="default"
          class="mt-6 h-12 w-full rounded-xl text-base"
          @click="goCreate"
        >
          {{ withRo(displayName) }} 워케이션 등록하기
        </BaseButton>
      </div>
    </template>

    <div v-else class="px-5 py-20 text-center">
      <p class="text-sm text-slate-400">지역 정보를 찾을 수 없어요</p>
      <button
        type="button"
        class="mt-3 text-xs font-bold text-blue-500"
        @click="goBack"
      >
        돌아가기
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ExternalLink } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import { useWorkationStore } from '@/stores/workationStore';
import { fetchPopularPlaces } from '@/components/workation/popularPlaces';
import MerchantMiniCard from '@/components/workation/MerchantMiniCard.vue';
import SwipeRow from '@/components/workation/SwipeRow.vue';
import {
  DISCLAIMER,
  SETTLEMENT_AFTER,
  programOf,
  withRo,
} from '@/components/workation/regionPrograms';

const route = useRoute();
const router = useRouter();
const workationStore = useWorkationStore();

const loading = ref(true);
const merchants = ref([]);

const regionId = computed(() => Number(route.params.regionId));

// 지역 이름은 /regions 에서만 알 수 있다. 지원 제도는 이름으로 찾는다
const region = computed(() =>
  workationStore.regions.find((item) => item.id === regionId.value),
);

const regionName = computed(() => region.value?.name ?? '');

const program = computed(() => programOf(regionName.value));

// region.name 은 '제주' 지만 문장에서는 '제주도' 로 쓴다
const displayName = computed(
  () => program.value?.displayName ?? regionName.value,
);

const isAfterSettlement = computed(
  () => program.value?.settlementType === SETTLEMENT_AFTER,
);

const loadMerchants = async () => {
  merchants.value = await fetchPopularPlaces({
    regionId: regionId.value,
    size: 10,
  });
};

onMounted(async () => {
  // 홈에서 넘어오면 이미 받아 둔 상태다. 새로고침으로 바로 들어온 경우만 받는다
  if (workationStore.regions.length === 0) {
    await workationStore.fetchRegions().catch(() => {});
  }
  await loadMerchants();
  loading.value = false;
});

// 지역을 미리 골라 둔 채로 등록 화면을 연다
const goCreate = () => {
  router.push(`/workation/create?regionId=${regionId.value}`);
};

const goBack = () => {
  router.push('/workation');
};
</script>
