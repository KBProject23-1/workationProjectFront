<script setup>
// 알림 설정 화면 — /account/me/notifications
// - 사용자가 알림 카테고리별 수신 여부를 Toggle Switch로 확인하고 변경할 수 있다
// - 페이지 진입 시 GET /users/me/notifications/settings 로 현재 설정을 조회한다
// - Toggle 변경 시 PATCH /users/me/notifications/settings 로 변경 필드만 전송한다
// - Optimistic Update: 즉시 UI 상태 변경 → API 성공 시 서버 응답으로 동기화 → 실패 시 Rollback
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useNotificationStore } from '@/stores/notificationStore';
import { useErrorToast } from '@/composables/useErrorToast';
import BaseHeader from '@/components/common/BaseHeader.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';

const router = useRouter();
const notificationStore = useNotificationStore();
const { settings, isLoading, pendingField } = storeToRefs(notificationStore);
const { showError } = useErrorToast();

const error = ref(null);

// 알림 카테고리 — 백엔드 enum → 사용자 친화적 한글 명칭 매핑
const CATEGORIES = [
  { key: 'budgetNotify', label: '예산 경고 알림', description: '예산 80% 소진 시 알림' },
  { key: 'transferNotify', label: '충전/환불 알림', description: '지갑 충전 및 환불 성공 시 알림' },
  { key: 'paymentNotify', label: '결제 알림', description: '결제 및 환불 성공 시 알림' },
  { key: 'workationNotify', label: '워케이션 알림', description: '워케이션 일정 관련 알림' },
  { key: 'settlementNotify', label: '정산 알림', description: '정산 필요 및 완료 시 알림' },
  { key: 'scheduleNotify', label: '일정 알림', description: '일정 관련 알림' },
];

// 전체 알림 켜기/끄기 토글
const allNotificationsOn = computed(() => {
  if (!settings.value) return false;
  return CATEGORIES.every((cat) => settings.value[cat.key] === true);
});

async function toggleAllNotifications() {
  if (pendingField.value) return;
  const newValue = !allNotificationsOn.value;
  try {
    await notificationStore.updateAllSettings(
      CATEGORIES.map((cat) => cat.key),
      newValue,
    );
  } catch (err) {
    showError(err, '전체 알림 설정을 변경하지 못했어요. 다시 시도해주세요.');
  }
}

function goBack() {
  router.back();
}

// Toggle 클릭 처리
async function handleToggle(categoryKey) {
  const newValue = !settings.value[categoryKey];
  try {
    await notificationStore.updateSetting(categoryKey, newValue);
  } catch (err) {
    showError(err, '알림 설정을 변경하지 못했어요. 다시 시도해주세요.');
  }
}

// 재시도 — 조회 실패 시
async function handleRetry() {
  error.value = null;
  try {
    await notificationStore.fetchSettings();
  } catch (err) {
    error.value = err;
    showError(err, '알림 설정을 불러오지 못했어요.');
  }
}

onMounted(async () => {
  try {
    await notificationStore.fetchSettings();
  } catch (err) {
    error.value = err;
    showError(err, '알림 설정을 불러오지 못했어요.');
  }
});
</script>

<template>
  <main class="min-h-screen bg-white px-5 pt-4 pb-8">
    <!-- 로딩 -->
    <LoadingScreen
      v-if="isLoading && !settings"
      title="알림 설정을 불러오고 있어요"
      description="잠시만 기다려 주세요"
    />

    <template v-else>
      <!-- 헤더 -->
      <div class="mb-4">
        <BaseHeader title="알림 설정" @back="goBack" />
      </div>

      <!-- 에러 + 재시도 -->
      <div v-if="error && !settings" class="flex flex-col items-center py-16">
        <p class="text-[14px] font-medium text-slate-400">
          알림 설정을 불러오지 못했어요
        </p>
        <button
          type="button"
          class="mt-4 rounded-xl bg-blue-50 px-6 py-2.5 text-[14px] font-semibold text-blue-600 transition-colors active:bg-blue-100"
          @click="handleRetry"
        >
          다시 시도
        </button>
      </div>

      <!-- 알림 설정 목록 -->
      <template v-else>
        <section>
          <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <p class="px-5 pt-3.5 text-xs font-medium text-slate-400">
              수신 설정
            </p>
            <!-- 전체 알림 켜기/끄기 -->
            <div class="flex items-center justify-between px-5 py-4">
              <div class="min-w-0 flex-1">
                <p class="text-[15px] font-medium text-slate-900">
                  전체 알림 {{ allNotificationsOn ? '끄기' : '켜기' }}
                </p>
                <p class="mt-0.5 text-[13px] text-slate-400">
                  모든 알림을 한 번에 켜거나 끕니다
                </p>
              </div>

              <!-- Toggle Switch -->
              <button
                type="button"
                role="switch"
                :aria-checked="allNotificationsOn"
                aria-label="전체 알림 수신 설정"
                :disabled="pendingField !== null"
                class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                :class="
                  allNotificationsOn
                    ? 'bg-blue-600'
                    : 'bg-slate-200'
                "
                @click="toggleAllNotifications"
              >
                <span
                  class="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                  :class="
                    allNotificationsOn
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  "
                />
              </button>
            </div>
            <div class="divide-y divide-slate-100">
              <div
                v-for="category in CATEGORIES"
                :key="category.key"
                class="flex items-center justify-between px-5 py-4"
              >
                <div class="min-w-0 flex-1">
                  <p class="text-[15px] font-medium text-slate-900">
                    {{ category.label }}
                  </p>
                  <p class="mt-0.5 text-[13px] text-slate-400">
                    {{ category.description }}
                  </p>
                </div>

                <!-- Toggle Switch -->
                <button
                  type="button"
                  role="switch"
                  :aria-checked="settings?.[category.key] ?? false"
                  :aria-label="category.label + ' 수신 설정'"
                  :disabled="pendingField !== null"
                  class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  :class="
                    settings?.[category.key]
                      ? 'bg-blue-600'
                      : 'bg-slate-200'
                  "
                  @click="handleToggle(category.key)"
                >
                  <span
                    class="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                    :class="
                      settings?.[category.key]
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    "
                  />
                </button>
              </div>
            </div>
          </div>
        </section>
      </template>
    </template>
  </main>
</template>
