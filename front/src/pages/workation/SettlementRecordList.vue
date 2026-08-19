<template>
  <div class="min-h-screen bg-white px-5 pt-4 pb-8">
    <div class="mb-4">
      <BaseHeader
        title="워케이션 정산기록"
        variant="centered"
        title-class="text-base font-bold text-slate-900"
        @back="goBack"
      />
    </div>

    <p v-if="loading" class="py-20 text-center text-sm text-slate-400">
      불러오는 중...
    </p>

    <p v-else-if="errorMessage" class="py-20 text-center text-sm text-red-500">
      {{ errorMessage }}
    </p>

    <template v-else-if="records.length > 0">
      <p class="mb-3 text-xs text-slate-400">
        정산을 마친 워케이션 {{ totalElements }}건
      </p>

      <div class="space-y-2">
        <button
          v-for="record in records"
          :key="record.id"
          type="button"
          class="w-full rounded-xl border border-slate-200 px-4 py-3 text-left transition-colors active:bg-slate-50"
          @click="goDetail(record.id)"
        >
          <div class="flex items-start justify-between gap-2">
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-bold text-slate-900">
                {{ record.title }}
              </span>
              <span class="mt-0.5 block text-xs text-slate-400">
                {{ record.region?.name }} · {{ dotDate(record.startDate) }} ~
                {{ dotDate(record.endDate) }} ({{ dayCount(record) }}일)
              </span>
            </span>
            <span class="shrink-0 text-slate-300">›</span>
          </div>

          <p
            class="mt-3 border-t border-slate-100 pt-2.5 text-right text-xs text-slate-400"
          >
            {{ workLabel }} {{ won(record.businessSpentTotal) }} / 개인
            {{ won(record.personalSpentTotal) }}
          </p>
        </button>
      </div>

      <button
        v-if="hasMore"
        type="button"
        class="mt-4 w-full rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-500 disabled:opacity-50"
        :disabled="loadingMore"
        @click="loadMore"
      >
        {{ loadingMore ? '불러오는 중...' : '더보기' }}
      </button>
    </template>

    <div v-else class="py-20 text-center">
      <p class="text-sm text-slate-400">아직 정산을 마친 워케이션이 없어요</p>
      <p class="mt-1 text-xs text-slate-400">
        워케이션을 마치면 여기에 기록이 쌓여요
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useWorkationStore } from '@/stores/workationStore';
import { useBudgetTypeLabel } from '@/composables/useBudgetTypeLabel';
import { dotDate, won } from '@/components/workation/format';
import BaseHeader from '@/components/common/BaseHeader.vue';

const PAGE_SIZE = 10;

const router = useRouter();
const workationStore = useWorkationStore();
const {
  records,
  totalElements,
  error: errorMessage,
} = storeToRefs(workationStore);

// 법인카드 보유 여부에 따라 법인 / 업무로 갈린다
const { workLabel, ensureCards } = useBudgetTypeLabel();

const loading = ref(true);
const loadingMore = ref(false);

const hasMore = computed(() => workationStore.hasMoreRecords);

// 목록 응답에는 totalDays 가 없어 기간으로 센다. 시작일과 종료일을 모두 포함한다
const dayCount = (record) => {
  if (!record.startDate || !record.endDate) return 0;
  const start = new Date(`${record.startDate}T00:00:00`);
  const end = new Date(`${record.endDate}T00:00:00`);
  return Math.round((end - start) / 86400000) + 1;
};

onMounted(async () => {
  await Promise.all([workationStore.fetchRecords(0, PAGE_SIZE), ensureCards()]);
  loading.value = false;
});

// 이어 붙이는 방식이라 이미 받은 목록은 다시 요청하지 않는다
const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return;

  loadingMore.value = true;
  await workationStore.fetchRecords(workationStore.page + 1, PAGE_SIZE, {
    append: true,
  });
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
