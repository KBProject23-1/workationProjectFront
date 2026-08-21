<template>
  <div class="bg-canvas flex min-h-screen w-full flex-col">
    <div class="px-5 pt-4">
      <BaseHeader title="일정 상세" @back="goBack" />
    </div>

    <main v-if="loading" class="flex-1 px-4 pt-4 pb-8">
      <div class="rounded-card bg-line/60 h-[202px] animate-pulse"></div>
      <div class="rounded-card bg-line/60 mt-4 h-12 animate-pulse"></div>
      <div class="rounded-card bg-line/60 mt-3 h-[180px] animate-pulse"></div>
    </main>

    <main
      v-else-if="errorMessage"
      class="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center"
    >
      <BaseErrorState
        title="일정 정보를 불러오지 못했어요"
        :description="errorMessage"
        @retry="load"
      />
    </main>

    <template v-else-if="detail">
      <main class="flex-1 px-4 pt-4 pb-8">
        <!-- 이미지와 이름이 장소 상세로 가는 진입점이다 -->
        <button
          type="button"
          class="rounded-sheet bg-surface shadow-card block w-full overflow-hidden text-left"
          @click="goMerchant"
        >
          <img
            :src="detail.thumbnailUrl && !imageLoadFailed
              ? detail.thumbnailUrl
              : defaultThumbnail"
            :alt="detail.merchantName"
            class="bg-canvas h-[202px] w-full object-cover"
            @error="imageLoadFailed = true"
          />

          <div class="flex items-center justify-between gap-3 px-[18px] py-4">
            <h2 class="text-title flex min-w-0 flex-1 items-center gap-1 font-bold -tracking-[0.01em] text-ink">
              <span class="truncate">{{ detail.merchantName }}</span>
              <ChevronRight :size="16" class="text-ink-mute shrink-0" />
            </h2>
            <span
              class="text-caption shrink-0 rounded-full px-2.5 py-1 font-bold"
              :class="statusStyle"
            >
              {{ statusLabel }}
            </span>
          </div>
        </button>

        <section class="rounded-card bg-surface shadow-card mt-3 px-[18px] py-2">
          <dl>
            <div
              v-for="row in infoRows"
              :key="row.label"
              class="border-line flex items-start justify-between gap-4 border-b py-3 last:border-b-0"
            >
              <dt class="text-body-sm shrink-0 text-ink-sub">{{ row.label }}</dt>
              <dd class="text-body-sm min-w-0 text-right font-semibold text-ink">
                {{ row.value }}
              </dd>
            </div>
          </dl>
        </section>

        <button
          type="button"
          class="rounded-card bg-surface shadow-card text-body mt-3 w-full py-3.5 font-bold text-ink transition-transform active:scale-[0.99] disabled:opacity-50"
          :disabled="saving || removing"
          @click="timePickerOpen = true"
        >
          시간 변경
        </button>

        <p class="text-body-sm mt-3 px-1 text-ink-mute">
          예약이 아니라 직접 정해 둔 일정이에요. 결제나 취소 수수료가 없어요.
        </p>

        <section v-if="sameDayItems.length > 0" class="mt-6">
          <h3 class="text-title mb-2.5 px-1 font-bold -tracking-[0.01em] text-ink">
            같은 날 일정
          </h3>
          <div
            class="divide-line rounded-card bg-surface shadow-card divide-y px-[18px]"
          >
            <button
              v-for="item in sameDayItems"
              :key="`${item.itemType}-${item.reservationId ?? item.scheduleId}`"
              type="button"
              class="flex w-full items-center justify-between gap-3 py-3.5 text-left"
              @click="goItem(item)"
            >
              <span class="min-w-0 flex-1">
                <span class="text-body block truncate font-semibold text-ink">
                  {{ item.merchantName }}
                </span>
                <span class="text-body-sm mt-0.5 block text-ink-mute">
                  {{ itemSubText(item) }}
                </span>
              </span>
              <ChevronRight :size="16" class="text-ink-mute shrink-0" />
            </button>
          </div>
        </section>
      </main>

      <footer class="bg-canvas sticky bottom-0 px-4 pt-3 pb-6">
        <button
          class="rounded-card bg-surface shadow-card text-body text-danger h-[52px] w-full font-bold transition-transform active:scale-[0.99] disabled:opacity-50"
          :disabled="saving || removing"
          @click="confirmOpen = true"
        >
          일정 삭제
        </button>
      </footer>
    </template>

    <ScheduleTimePicker
      :visible="timePickerOpen"
      :date="visitDate"
      :current="visitTime"
      :loading="saving"
      :disabled-times="unavailableTimes"
      @confirm="changeTime"
      @cancel="timePickerOpen = false"
    />

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
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronRight } from '@lucide/vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { getSchedules } from '@/api/schedule';
import { hourMinute, shortRange, weekday } from '@/components/workation/format';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';
import ScheduleTimePicker from '@/components/workation/ScheduleTimePicker.vue';
import { getMerchantDefaultImage } from '@/config/merchantDefaultImages';

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

// 같은 날 일정에서 다른 일정으로 넘어가면 경로만 바뀌고 컴포넌트는 유지된다.
// ref 로 두고 감시해야 화면이 새 일정으로 갱신된다
const scheduleId = computed(() => route.params.scheduleId);

const loading = ref(true);
const removing = ref(false);
const saving = ref(false);
const confirmOpen = ref(false);
const timePickerOpen = ref(false);
const errorMessage = ref('');
const sameDayItems = ref([]);
const imageLoadFailed = ref(false);

const unavailableTimes = computed(() => [
  ...new Set(
    sameDayItems.value
      .map((item) => item.scheduledTime ?? item.scheduledAt?.slice(11))
      .filter(Boolean)
      .map((time) => time.slice(0, 5)),
  ),
]);

const detail = computed(() => scheduleStore.detail);
const defaultThumbnail = computed(() => getMerchantDefaultImage({
  category: detail.value?.merchantCategory,
  merchantId: detail.value?.merchantId,
  activityType: detail.value?.activityType,
}));

// scheduledAt 은 2026-08-15T18:00:00 형태로 온다
const visitDate = computed(() => detail.value?.scheduledAt?.slice(0, 10) ?? '');

const visitTime = computed(() =>
  hourMinute(detail.value?.scheduledAt?.slice(11) ?? ''),
);

const formattedDate = computed(() =>
  visitDate.value
    ? `${visitDate.value.replaceAll('-', '.')} (${weekday(visitDate.value)})`
    : '-',
);

const categoryLabel = computed(
  () => CATEGORY_LABELS[detail.value?.merchantCategory] ?? '일정',
);

// 항목이 늘거나 줄어도 표는 그대로 두고 이 배열만 고치면 된다
const infoRows = computed(() => [
  { label: '방문 예정일', value: formattedDate.value },
  { label: '방문 시간', value: visitTime.value },
  { label: '분류', value: categoryLabel.value },
  { label: '주소', value: detail.value?.address || '-' },
  { label: '구분', value: '직접 등록한 일정' },
]);
// 지난 일정인지 오늘인지 남았는지를 배지로 보여준다
const dayGap = computed(() => {
  if (!visitDate.value) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${visitDate.value}T00:00:00`);
  return Math.round((target - today) / 86400000);
});

const statusLabel = computed(() => {
  const gap = dayGap.value;
  if (gap === null) return '일정';
  if (gap < 0) return '지난 일정';
  if (gap === 0) return '오늘';
  return `D-${gap}`;
});

const statusStyle = computed(() => {
  const gap = dayGap.value;
  if (gap === null || gap < 0) return 'bg-canvas text-ink-mute';
  if (gap === 0) return 'bg-danger/10 text-danger';
  return 'bg-brand-weak text-brand';
});

const itemSubText = (item) => {
  if (item.scheduledTime) return hourMinute(item.scheduledTime);
  return shortRange(item.startDate, item.endDate);
};

// 같은 날 무엇이 더 있는지 보여야 시간을 옮길지 판단할 수 있다
const loadSameDay = async () => {
  if (!visitDate.value) return;
  try {
    const { data } = await getSchedules(workationId, {
      startDate: visitDate.value,
      days: 1,
    });
    const items = data.schedules?.[0]?.items ?? [];
    sameDayItems.value = items.filter(
      (item) => String(item.scheduleId ?? '') !== String(scheduleId.value),
    );
  } catch {
    sameDayItems.value = [];
  }
};

const load = async () => {
  loading.value = true;
  errorMessage.value = '';
  imageLoadFailed.value = false;
  try {
    await scheduleStore.fetchDetail(workationId, scheduleId.value);
    await loadSameDay();
  } catch (error) {
    errorMessage.value = error.message || '일정을 불러오지 못했습니다.';
  } finally {
    loading.value = false;
  }
};

onMounted(load);

watch(scheduleId, load);

// 날짜는 그대로 두고 시각만 바꾼다. 다른 날로 옮기는 것은 새 일정으로 본다
const changeTime = async (time) => {
  if (saving.value) return;
  saving.value = true;
  try {
    const hasConflict = await scheduleStore.hasScheduleAt(
      workationId,
      visitDate.value,
      time,
      scheduleId.value,
    );
    if (hasConflict) {
      await loadSameDay();
      showError(null, '이미 등록한 일정이 있습니다');
      return;
    }
    await scheduleStore.updateSchedule(
      workationId,
      scheduleId.value,
      `${visitDate.value}T${time}`,
    );
    timePickerOpen.value = false;
    await loadSameDay();
  } catch (error) {
    showError(error, '시간을 변경하지 못했습니다.');
  } finally {
    saving.value = false;
  }
};

const remove = async () => {
  if (removing.value) return;
  removing.value = true;
  try {
    await scheduleStore.deleteSchedule(workationId, scheduleId.value);
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

const goItem = (item) => {
  if (item.itemType === 'RESERVATION') {
    router.push(`/reservations/${item.reservationId}`);
    return;
  }
  router.push(`/workation/${workationId}/schedules/${item.scheduleId}`);
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push('/workation');
};
</script>
