<script setup>
// 알림 목록 화면 — /notifications
// - 로그인한 사용자의 알림 목록을 최신순으로 표시한다
// - 커서 기반 페이지네이션 + 무한 스크롤
// - 카테고리 필터 (전체, 예산, 입출금, 결제, 워케이션, 정산, 일정)
// - 단건 읽음 처리 (알림 클릭 시) / 전체 읽음 처리 (상단 버튼)
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { CheckCheck } from '@lucide/vue';
import { useNotificationStore } from '@/stores/notificationStore';
import { useErrorToast } from '@/composables/useErrorToast';
import BaseHeader from '@/components/common/BaseHeader.vue';
import BaseEmptyState from '@/components/common/BaseEmptyState.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import {
  Dialog,
  DialogScrollContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const router = useRouter();
const notificationStore = useNotificationStore();
const { showError } = useErrorToast();

// ── 알림 상세 모달 ──
const selectedNotification = ref(null);
const isDetailModalOpen = ref(false);

const {
  notifications,
  selectedCategory,
  hasNext,
  isLoading,
  isAppending,
  error,
  unreadCount,
} = storeToRefs(notificationStore);

// ── 카테고리 필터 ──
const CATEGORIES = [
  { label: '전체', value: null },
  { label: '예산', value: 'BUDGET_NOTIFY' },
  { label: '입출금', value: 'TRANSFER_NOTIFY' },
  { label: '결제', value: 'PAYMENT_NOTIFY' },
  { label: '워케이션', value: 'WORKATION_NOTIFY' },
  { label: '정산', value: 'SETTLEMENT_NOTIFY' },
  { label: '일정', value: 'SCHEDULE_NOTIFY' },
];

// ── 무한 스크롤 ──
const sentinel = ref(null);
let observer = null;

function setupObserver() {
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasNext.value && !isAppending.value && !isLoading.value) {
      loadMore();
    }
  });
  if (sentinel.value) observer.observe(sentinel.value);
}

async function loadMore() {
  try {
    await notificationStore.appendNotifications();
  } catch (err) {
    showError(err, '추가 알림을 불러오지 못했어요.');
  }
}

// ── 카테고리 변경 ──
async function changeCategory(category) {
  if (selectedCategory.value === category) return;

  // Observer 해제 → 목록 초기화 → 재조회 → Observer 재설정
  observer?.disconnect();
  try {
    await notificationStore.fetchNotifications(category);
  } catch (err) {
    showError(err, '알림 목록을 불러오지 못했어요.');
    return;
  }
  await nextTick();
  setupObserver();
}

// ── 알림 클릭 (단건 읽음 처리 + 모달 열기) ──
async function handleNotificationClick(notification) {
  // 이미 읽은 알림이면 읽음 처리 API 호출하지 않음
  if (!notification.isRead) {
    try {
      await notificationStore.markAsRead(notification.notificationId);
    } catch (err) {
      showError(err, '알림 읽음 처리에 실패했어요.');
    }
  }
  // 모달에 표시할 알림 선택 및 열기
  selectedNotification.value = notification;
  isDetailModalOpen.value = true;
}

function closeDetailModal() {
  isDetailModalOpen.value = false;
  selectedNotification.value = null;
}

// ── 전체 읽음 처리 ──
async function handleMarkAllRead() {
  if (unreadCount.value === 0) return;
  try {
    await notificationStore.markAllAsRead();
  } catch (err) {
    showError(err, '전체 읽음 처리에 실패했어요.');
  }
}

// ── 시간 포맷 ──
function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

// ── 카테고리 한글명 ──
const CATEGORY_LABEL_MAP = {
  BUDGET_NOTIFY: '예산',
  TRANSFER_NOTIFY: '입출금',
  PAYMENT_NOTIFY: '결제',
  WORKATION_NOTIFY: '워케이션',
  SETTLEMENT_NOTIFY: '정산',
  SCHEDULE_NOTIFY: '일정',
};

function getCategoryLabel(category) {
  return CATEGORY_LABEL_MAP[category] || category;
}

// ── 뒤로 가기 ──
function goBack() {
  router.back();
}

// ── 초기 조회 + Observer 설정 ──
onMounted(async () => {
  try {
    await notificationStore.fetchNotifications();
  } catch (err) {
    showError(err, '알림 목록을 불러오지 못했어요.');
  }
  await nextTick();
  setupObserver();
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <div class="flex min-h-screen w-full flex-col bg-white pb-8">
    <!-- 헤더 -->
    <header class="sticky top-0 z-10 bg-white">
      <div class="px-5 pt-4">
        <BaseHeader title="알림" @back="goBack">
          <template #right>
            <button
              type="button"
              :disabled="unreadCount === 0"
              class="flex items-center gap-1 rounded-lg px-2 py-1 text-[13px] font-semibold transition-colors active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              :class="unreadCount > 0 ? 'text-blue-600' : 'text-slate-400'"
              @click="handleMarkAllRead"
            >
              <CheckCheck :size="16" />
              전체 읽음
            </button>
          </template>
        </BaseHeader>
      </div>

      <!-- 카테고리 필터 -->
      <div class="flex gap-1.5 overflow-x-auto px-5 pb-3 scrollbar-hide">
        <button
          v-for="cat in CATEGORIES"
          :key="cat.label"
          type="button"
          class="shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
          :class="
            selectedCategory === cat.value
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-slate-200 bg-white text-slate-600 active:bg-slate-50'
          "
          @click="changeCategory(cat.value)"
        >
          {{ cat.label }}
        </button>
      </div>
    </header>

    <!-- 로딩 (초기 조회) -->
    <LoadingScreen
      v-if="isLoading && notifications.length === 0"
      title="알림을 불러오고 있어요"
      description="잠시만 기다려 주세요"
      :fullscreen="false"
    />

    <!-- 에러 -->
    <div
      v-else-if="error && notifications.length === 0"
      class="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center"
    >
      <BaseErrorState
        title="알림을 불러오지 못했어요"
        @retry="notificationStore.fetchNotifications(selectedCategory)"
      />
    </div>

    <!-- 빈 상태 -->
    <div
      v-else-if="notifications.length === 0"
      class="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center"
    >
      <BaseEmptyState
        :title="selectedCategory ? `${getCategoryLabel(selectedCategory)} 알림이 없어요` : '새로운 알림이 없어요'"
      />
    </div>

    <!-- 알림 목록 -->
    <template v-else>
      <div class="flex flex-1 flex-col">
        <div
          v-for="notification in notifications"
          :key="notification.notificationId"
          type="button"
          class="flex w-full cursor-pointer flex-col gap-1 border-b border-slate-100 px-5 py-4 text-left transition-colors active:bg-slate-50"
          :class="notification.isRead ? 'bg-white' : 'bg-blue-50/50'"
          @click="handleNotificationClick(notification)"
        >
          <!-- 상단: 카테고리 + 중요 + 시간 -->
          <div class="flex items-center gap-2">
            <span
              v-if="!notification.isRead"
              class="h-2 w-2 shrink-0 rounded-full bg-blue-600"
            />
            <span
              v-else
              class="h-2 w-2 shrink-0"
            />
            <span
              class="text-[11px] font-semibold text-slate-400"
            >
              {{ getCategoryLabel(notification.category) }}
            </span>
            <span
              v-if="notification.important"
              class="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-500"
            >
              중요
            </span>
            <span class="ml-auto text-[11px] text-slate-400">
              {{ formatTime(notification.createdAt) }}
            </span>
          </div>

          <!-- 제목 -->
          <p
            class="mt-1 text-[15px] leading-snug"
            :class="notification.isRead ? 'font-medium text-slate-600' : 'font-bold text-slate-900'"
          >
            {{ notification.title }}
          </p>

          <!-- 내용 (최대 2줄 말줄임) -->
          <p
            class="mt-0.5 text-[13px] leading-relaxed line-clamp-2"
            :class="notification.isRead ? 'text-slate-400' : 'text-slate-600'"
          >
            {{ notification.content }}
          </p>
        </div>
      </div>

      <!-- 추가 로딩 -->
      <p
        v-if="isAppending"
        class="py-4 text-center text-[12px] text-slate-400"
      >
        불러오는 중...
      </p>

      <!-- 더 이상 없음 -->
      <p
        v-else-if="!hasNext && notifications.length > 0"
        class="py-4 text-center text-[12px] text-slate-300"
      >
        마지막 알림이에요
      </p>

      <!-- 무한 스크롤 감지 요소 -->
      <div ref="sentinel" class="h-1" />
    </template>

    <!-- 알림 상세 모달 -->
    <Dialog
      :open="isDetailModalOpen"
      @update:open="(open) => { if (!open) closeDetailModal(); }"
    >
      <DialogScrollContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ selectedNotification?.title }}</DialogTitle>
        </DialogHeader>

        <!-- 내용 -->
        <div
          v-if="selectedNotification"
          class="max-h-[60vh] overflow-y-auto whitespace-pre-line text-[14px] leading-relaxed text-slate-600"
        >
          {{ selectedNotification.content }}
        </div>

        <!-- 생성 시간 -->
        <p
          v-if="selectedNotification"
          class="text-right text-[12px] text-slate-400"
        >
          {{ formatTime(selectedNotification.createdAt) }}
        </p>
      </DialogScrollContent>
    </Dialog>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
