<script setup>
// 내 정보 조회 화면 — /account/me (Figma: 내활동)
// - 로그인 사용자의 기본 정보(이름/이메일/휴대폰)를 GET /users/me 로 조회해 보여준다 (authStore.fetchMyInfo 재사용)
// - 카드 구성 (Figma 내활동 기준)
//   ① 프로필 + 프로필 수정  ② 메뉴(내 장소·나의 워케이션 스타일·내가 작성한 리뷰)  ③ 설정(계정·알림)
// - 구현된 메뉴는 해당 화면으로 이동하고, 미구현 메뉴는 안내 토스트만 노출한다.
// - 하단 로그아웃 버튼: POST /auth/logout 호출 → authStore 초기화 → 로그인 화면(/login) 이동
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { toast } from 'vue-sonner';
import { Mail, Phone } from '@lucide/vue';
import { useAuthStore } from '@/stores/authStore';
import { useErrorToast } from '@/composables/useErrorToast';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';

const router = useRouter();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { showError } = useErrorToast();

const loading = ref(true);

// 메뉴 카드(② 메뉴)의 행
// to 가 있으면 해당 화면으로 이동하고, 없으면 미구현이라 안내 토스트만 노출한다
const menuItems = [
  { label: '내 장소', to: '/bookmarks' },
  { label: '나의 워케이션 스타일', to: '/account/me/survey' },
  { label: '내가 작성한 리뷰', to: '/users/me/reviews' },
  { label: '워케이션 정산기록 보기', to: '/workation/records' },
];

// 설정 카드(③ 설정)의 행 — 계정 설정은 진입 route 로 이동, 알림 설정은 미구현 (토스트만)
const settingItems = [
  { label: '계정 설정', to: '/account/me/settings' },
  { label: '알림 설정', to: null },
];

// 휴대폰 번호는 010-0000-0000 형식으로 표기한다 (저장값은 하이픈 없는 숫자 — 로그인 화면과 동일 규칙)
function formatPhone(digits) {
  const d = (digits || '').replace(/\D/g, '');
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
}

// 아바타 — 이름 첫 글자 (비어 있으면 워케이너 첫 글자)
const avatarInitial = computed(
  () => user.value?.name?.trim()?.charAt(0) || '워',
);

// 아직 미구현된 기능 — 메뉴별 안내 토스트만 노출
function showComingSoon(label) {
  toast(`${label} 기능은 준비 중이에요`);
}

function openMenu(item) {
  if (item.to) {
    router.push(item.to);
    return;
  }
  showComingSoon(item.label);
}

function goBack() {
  router.back();
}

async function handleLogout() {
  try {
    await authStore.logout();
    // 로그아웃 성공 — 인증 상태가 초기화된 상태로 로그인 화면 이동
    router.replace('/login');
  } catch (err) {
    showError(err, '로그아웃에 실패했어요. 다시 시도해주세요.');
  }
}

onMounted(async () => {
  try {
    await authStore.fetchMyInfo();
  } catch (err) {
    showError(err, '내 정보를 불러오지 못했어요.');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="min-h-screen bg-canvas px-5 pt-4 pb-8">
    <LoadingScreen
      v-if="loading"
      title="내 정보를 불러오고 있어요"
      description="잠시만 기다려 주세요"
    />

    <template v-else>
      <!-- 헤더 -->
      <div class="mb-4">
        <BaseHeader
          title="내 정보"
          @back="goBack"
        />
      </div>

      <!-- ① 사용자 프로필 / 기본 정보 + 프로필 수정 -->
      <section>
        <div
          class="overflow-hidden rounded-card border border-line bg-white"
        >
          <div class="flex items-center gap-4 px-5 pt-5 pb-4">
            <div
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-weak text-heading font-bold text-brand"
            >
              {{ avatarInitial }}
            </div>
            <div class="min-w-0">
              <p class="text-title font-bold text-ink">
                {{ user?.name }}
              </p>
              <div class="mt-1.5 space-y-1">
                <p class="flex items-center gap-1.5 text-body-sm text-ink-sub">
                  <Mail :size="14" class="shrink-0 text-ink-mute" />
                  <span class="truncate">{{ user?.email }}</span>
                </p>
                <p class="flex items-center gap-1.5 text-body-sm text-ink-sub">
                  <Phone :size="14" class="shrink-0 text-ink-mute" />
                  <span>{{ formatPhone(user?.phoneNumber) }}</span>
                </p>
              </div>
            </div>
          </div>
          <div class="border-t border-line">
            <button
              type="button"
              class="flex w-full items-center px-5 py-4 text-left transition-colors active:bg-canvas"
              @click="router.push('/account/me/edit')"
            >
              <span class="text-body font-semibold text-brand">
                프로필 수정
              </span>
            </button>
          </div>
        </div>
      </section>

      <!-- ② 메뉴 -->
      <section class="mt-3">
        <div
          class="overflow-hidden rounded-card border border-line bg-white"
        >
          <p class="px-5 pt-3.5 text-body-sm font-medium text-ink-mute">메뉴</p>
          <div class="mt-1 divide-y divide-line">
            <button
              v-for="item in menuItems"
              :key="item.label"
              type="button"
              class="flex w-full items-center px-5 py-4 text-left transition-colors active:bg-canvas"
              @click="openMenu(item)"
            >
              <span class="flex-1 text-body font-medium text-ink">
                {{ item.label }}
              </span>
              <span v-if="item.to" class="text-ink-mute">›</span>
            </button>
          </div>
        </div>
      </section>

      <!-- ③ 설정 -->
      <section class="mt-3">
        <div
          class="overflow-hidden rounded-card border border-line bg-white"
        >
          <p class="px-5 pt-3.5 text-body-sm font-medium text-ink-mute">설정</p>
          <div class="mt-1 divide-y divide-line">
            <button
              v-for="item in settingItems"
              :key="item.label"
              type="button"
              class="flex w-full items-center px-5 py-4 text-left transition-colors active:bg-canvas"
              @click="
                item.to ? router.push(item.to) : showComingSoon(item.label)
              "
            >
              <span class="text-body font-medium text-ink">
                {{ item.label }}
              </span>
            </button>
          </div>
        </div>
      </section>

      <!-- ④ 로그아웃 -->
      <section class="mt-8">
        <button
          type="button"
          class="mx-auto flex flex-col items-center transition-opacity active:opacity-60"
          @click="handleLogout"
        >
          <span class="text-body font-semibold text-ink-mute">
            로그아웃
          </span>
          <span class="mt-1.5 h-px w-[52px] bg-slate-400" />
        </button>
      </section>
    </template>
  </main>
</template>
