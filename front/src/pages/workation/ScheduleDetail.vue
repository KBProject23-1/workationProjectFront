<template>
  <div class="min-h-screen bg-white px-5 pt-4 pb-8">
    <header class="relative mb-4 flex items-center justify-center">
      <button
        class="absolute left-0 -ml-2 flex h-11 w-11 items-center justify-center text-slate-900"
        aria-label="뒤로 가기"
        @click="goBack"
      >
        <ChevronLeft class="h-7 w-7" />
      </button>
      <h1 class="text-base font-bold text-slate-900">일정 상세</h1>
    </header>

    <p v-if="loading" class="py-20 text-center text-sm text-slate-400">
      불러오는 중...
    </p>

    <template v-else-if="detail">
      <div class="flex items-start justify-between">
        <span class="text-xs text-slate-400">{{ dotDate(visitDate) }}</span>
        <span
          class="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-600"
        >
          {{ categoryLabel }}
        </span>
      </div>

      <p class="mt-1 text-2xl font-bold text-slate-900">{{ visitTime }}</p>
      <p class="text-sm text-slate-500">{{ detail.merchantName }}</p>

      <p class="mt-4 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
        예약이 아니라 직접 정해 둔 일정이에요. 결제나 취소 수수료는 없어요
      </p>

      <section class="mt-6">
        <h2 class="mb-2 text-sm font-bold text-slate-900">장소</h2>
        <div class="rounded-xl border border-slate-200 px-4 py-3">
          <p class="text-sm font-bold text-slate-900">
            {{ detail.merchantName }}
          </p>
          <p class="mt-0.5 text-xs text-slate-400">{{ detail.address }}</p>
        </div>
        <button
          class="mt-2 text-xs font-bold text-blue-600"
          @click="goMerchant"
        >
          장소 상세 보기 ›
        </button>
      </section>

      <Button
        variant="outline"
        class="mt-8 h-12 w-full rounded-xl text-base text-red-500 hover:text-red-600"
        :disabled="removing"
        @click="confirmOpen = true"
      >
        일정 삭제하기
      </Button>
    </template>

    <BaseConfirmModal
      :visible="confirmOpen"
      title="이 일정을 삭제할까요?"
      message="스케줄에서 사라져요. 예약이 아니라 취소 수수료는 없어요."
      :loading="removing"
      @confirm="remove"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { dotDate, hourMinute } from '@/components/workation/format';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';

const CATEGORY_LABELS = {
  RESTAURANT: '음식점',
  ACTIVITY: '여가 활동',
};

// 장소 상세는 카테고리마다 화면이 다르다
const MERCHANT_ROUTES = {
  RESTAURANT: 'restaurants',
  ACTIVITY: 'activities',
};

const route = useRoute();
const router = useRouter();
const scheduleStore = useScheduleStore();
const { showError } = useErrorToast();

const workationId = route.params.workationId;
const scheduleId = route.params.scheduleId;

const loading = ref(true);
const removing = ref(false);
const confirmOpen = ref(false);

const detail = computed(() => scheduleStore.detail);

// scheduledAt 은 2026-08-15T18:00:00 형태로 온다
const visitDate = computed(
  () => detail.value?.scheduledAt?.slice(0, 10) ?? '',
);

const visitTime = computed(() =>
  hourMinute(detail.value?.scheduledAt?.slice(11) ?? ''),
);

const categoryLabel = computed(
  () => CATEGORY_LABELS[detail.value?.merchantCategory] ?? '일정',
);

onMounted(async () => {
  try {
    await scheduleStore.fetchDetail(workationId, scheduleId);
  } catch (error) {
    showError(error, '일정을 불러오지 못했습니다.');
  } finally {
    loading.value = false;
  }
});

const remove = async () => {
  if (removing.value) return;
  removing.value = true;
  try {
    await scheduleStore.deleteSchedule(workationId, scheduleId);
    router.push('/workation');
  } catch (error) {
    showError(error, '일정을 삭제하지 못했습니다.');
  } finally {
    removing.value = false;
    confirmOpen.value = false;
  }
};

const goMerchant = () => {
  const path = MERCHANT_ROUTES[detail.value?.merchantCategory];
  if (!path) return;
  router.push(`/merchants/${path}/${detail.value.merchantId}`);
};

const goBack = () => {
  router.push('/workation');
};
</script>
