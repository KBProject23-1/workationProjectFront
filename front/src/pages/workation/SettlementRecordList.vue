<template>
  <div class="bg-canvas flex min-h-screen flex-col px-4 pt-4 pb-8">
    <div class="mb-4 px-1">
      <BaseHeader title="워케이션 정산기록" @back="goBack" />
    </div>

    <LoadingScreen
      v-if="loading"
      title="정산기록을 불러오고 있어요"
      :fullscreen="false"
    />

    <BaseErrorState
      v-else-if="pageError"
      :title="pageError"
      @retry="loadRecords"
    />

    <template v-else-if="records.length > 0">
      <p class="text-body-sm mb-3 px-1 text-ink-sub">
        정산을 마친 워케이션 {{ totalElements }}건
      </p>

      <div class="space-y-2.5">
        <button
          v-for="record in records"
          :key="record.id"
          type="button"
          class="rounded-card bg-surface shadow-card w-full px-[18px] py-4 text-left transition-transform active:scale-[0.99]"
          @click="goDetail(record.id)"
        >
          <div class="flex items-start justify-between gap-2">
            <span class="min-w-0 flex-1">
              <span class="text-body block truncate font-semibold text-ink">
                {{ record.title }}
              </span>
              <span class="text-body-sm mt-1 block text-ink-mute">
                {{ record.region?.name }} · {{ dotDate(record.startDate) }} ~
                {{ dotDate(record.endDate) }} ({{ dayCount(record) }}일)
              </span>
            </span>
            <ChevronRight :size="16" class="text-ink-mute mt-0.5 shrink-0" />
          </div>

          <p
            class="border-line text-body-sm mt-3 border-t pt-3 text-right text-ink-sub"
          >
            {{ workLabel }} {{ won(record.businessSpentTotal) }} / 개인
            {{ won(record.personalSpentTotal) }}
          </p>
        </button>
      </div>

      <button
        v-if="hasMore"
        type="button"
        class="rounded-card bg-surface shadow-card text-body-sm mt-4 w-full py-3.5 font-bold text-ink-sub disabled:opacity-50"
        :disabled="loadingMore"
        @click="loadMore"
      >
        {{ loadingMore ? '불러오는 중...' : '더보기' }}
      </button>
    </template>

    <BaseEmptyState
      v-else
      title="아직 정산을 마친 워케이션이 없어요"
      description="워케이션을 마치면 여기에 기록이 쌓여요"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ChevronRight } from '@lucide/vue';
import { useWorkationStore } from '@/stores/workationStore';
import { useBudgetTypeLabel } from '@/composables/useBudgetTypeLabel';
import { dotDate, won, daysBetween } from '@/components/workation/format';
import BaseHeader from '@/components/common/BaseHeader.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';
import BaseEmptyState from '@/components/common/BaseEmptyState.vue';
import { useErrorToast } from '@/composables/useErrorToast';

const PAGE_SIZE = 10;

const router = useRouter();
const workationStore = useWorkationStore();
const { records, totalElements } = storeToRefs(workationStore);
const { showError } = useErrorToast();

// 법인카드 보유 여부에 따라 법인 / 업무로 갈린다
const { workLabel, ensureCards } = useBudgetTypeLabel();

const loading = ref(true);
const loadingMore = ref(false);
// workationStore.error 는 더보기 실패 같은 부가 호출과도 공유되니, 페이지 전체를
// 에러 화면으로 덮을지는 최초 목록 조회 직후 값만 따로 스냅샷 떠서 정한다
const pageError = ref(null);

const hasMore = computed(() => workationStore.hasMoreRecords);

// 목록 응답에는 totalDays 가 없어 기간으로 센다
const dayCount = (record) => daysBetween(record.startDate, record.endDate);

const loadRecords = async () => {
  loading.value = true;
  await Promise.all([workationStore.fetchRecords(0, PAGE_SIZE), ensureCards()]);
  pageError.value = workationStore.error;
  loading.value = false;
};

onMounted(loadRecords);

// 이어 붙이는 방식이라 이미 받은 목록은 다시 요청하지 않는다.
// 더보기 실패는 이미 보여준 목록을 지우지 않고 토스트로만 알린다
const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return;

  loadingMore.value = true;
  const ok = await workationStore.fetchRecords(workationStore.page + 1, PAGE_SIZE, {
    append: true,
  });
  if (!ok) showError(null, '기록을 더 불러오지 못했어요. 다시 시도해 주세요.');
  loadingMore.value = false;
};

// 정산 상세는 진행 중 워케이션과 같은 화면을 쓴다.
// 정산이 끝난 건은 그 화면이 기록 조회 모드로 열린다
const goDetail = (workationId) => {
  router.push(`/workation/${workationId}/settlement`);
};

const goBack = () => {
  router.back();
};
</script>
