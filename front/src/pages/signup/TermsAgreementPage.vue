<script setup>
// 회원가입 약관 동의 화면
// - GET /api/v1/auth/terms (docs: 약관 목록 데이터 조회) 로 백엔드 DB 에 저장된 약관 목록/본문을 조회해 렌더링한다.
// - 약관 제목과 본문은 서버 응답만 사용한다. (프론트엔드 하드코딩 약관 전문 없음)
// - 조회 실패 시 하드코딩 대체 데이터를 쓰지 않고 오류 상태 + 다시 시도 버튼을 노출한다.
// - 전체 동의 / 개별 동의 상태를 동기화하고, 필수 약관이 모두 동의된 경우에만 '다음' 버튼을 활성화한다.
// - '다음' 클릭 시 동의한 약관 ID 목록을 AuthStore 에 보관한 뒤 본인인증 화면(/signup/verify)으로 이동한다.
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Check } from '@lucide/vue';
import { useAuthStore } from '@/stores/authStore';
import { getTerms } from '@/api/auth';
import BaseHeader from '@/components/common/BaseHeader.vue';
import {
  Dialog,
  DialogScrollContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const router = useRouter();
const authStore = useAuthStore();

const terms = ref([]);
const loading = ref(true);
const loadError = ref(false);
const agreedTermIds = ref(new Set());
const selectedTerm = ref(null);

const allAgreed = computed(
  () => terms.value.length > 0 && terms.value.every((term) => agreedTermIds.value.has(term.termId)),
);

const canProceed = computed(
  () => terms.value.length > 0 && terms.value.filter((term) => term.required).every((term) => agreedTermIds.value.has(term.termId)),
);

function isAgreed(termId) {
  return agreedTermIds.value.has(termId);
}

function toggleAll() {
  agreedTermIds.value = allAgreed.value
    ? new Set()
    : new Set(terms.value.map((term) => term.termId));
}

function toggleTerm(termId) {
  const next = new Set(agreedTermIds.value);
  if (next.has(termId)) next.delete(termId);
  else next.add(termId);
  agreedTermIds.value = next;
}

// API title에 '(필수)/(선택)' 접미사가 포함되어 있어 화면에서는 우측 태그로 분리 표시한다.
function cleanTitle(title) {
  return title.replace(/\s*\((필수|선택)\)\s*$/, '');
}

function goBack() {
  // 단독 라우트(/signup/terms)로 직접 접근한 경우(히스토리 없음)에는 회원가입 화면으로 이동한다.
  if (window.history.length > 1) router.back();
  else router.replace('/signup');
}

function goNext() {
  // 동의한 약관 ID 목록을 보관한 뒤 본인인증 화면(/signup/verify)으로 이동한다.
  // (최종 회원가입 요청 시 agreedTermsIds 로 백엔드에 전달된다)
  authStore.setAgreedTerms([...agreedTermIds.value]);
  router.push('/signup/verify');
}

// 백엔드 DB 약관 목록 조회 (GET /api/v1/auth/terms)
async function fetchTerms() {
  loading.value = true;
  loadError.value = false;
  // 재조회 시 목록이 바뀔 수 있으므로 동의 상태도 함께 초기화한다.
  agreedTermIds.value = new Set();
  try {
    const { data } = await getTerms();
    terms.value = data?.termsList ?? [];
  } catch {
    // 하드코딩 폴백 없음 — 오류 상태를 표시하고 사용자가 다시 시도할 수 있게 한다.
    terms.value = [];
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchTerms);
</script>

<template>
  <div class="flex flex-col h-dvh bg-white overflow-hidden">
    <!-- 헤더 -->
    <div class="shrink-0 px-2 pt-2">
      <BaseHeader
        title="약관동의"
        @back="goBack"
      />
    </div>

    <!-- 본문 -->
    <main class="flex-1 min-h-0 overflow-y-auto px-6 pt-4 pb-6">
      <h2 class="text-[22px] font-extrabold leading-snug tracking-tight text-[#0B3155]">
        원활한 서비스 이용을 위해<br />약관 동의가 필요해요
      </h2>

      <!-- 로딩 스켈레톤 -->
      <div v-if="loading" class="mt-7 space-y-3">
        <div class="h-16 animate-pulse rounded-[20px] bg-[#F0F4F9]" />
        <div class="h-14 animate-pulse rounded-[20px] bg-[#F0F4F9]" />
        <div class="h-14 animate-pulse rounded-[20px] bg-[#F0F4F9]" />
      </div>

      <!-- 조회 실패 상태 (하드코딩 대체 데이터 없음) -->
      <section
        v-else-if="loadError"
        class="mt-7 overflow-hidden rounded-[20px] border border-[#DFE7F0] bg-white"
      >
        <div class="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <p class="text-[15px] font-bold text-[#191F28]">약관 정보를 불러오지 못했어요</p>
          <p class="text-[12.5px] font-medium leading-relaxed text-[#7186A0]">
            네트워크 상태를 확인한 뒤 다시 시도해 주세요.
          </p>
          <button
            type="button"
            class="mt-2 rounded-full bg-[#2878F0] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#1E68D6] active:scale-95"
            @click="fetchTerms"
          >
            다시 시도
          </button>
        </div>
      </section>

      <!-- 약관 리스트 -->
      <section v-else class="mt-7 overflow-hidden rounded-[20px] border border-[#DFE7F0] bg-white">
        <!-- 전체 동의 -->
        <button
          type="button"
          role="checkbox"
          :aria-checked="allAgreed"
          class="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[#FAFBFD]"
          @click="toggleAll"
        >
          <span
            class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border-2 transition-colors"
            :class="allAgreed ? 'border-[#2878F0] bg-[#2878F0]' : 'border-[#B9C5D2] bg-white'"
          >
            <Check v-if="allAgreed" :size="14" :stroke-width="3.5" class="text-white" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-[15px] font-bold text-[#191F28]">전체 동의</span>
            <span class="mt-0.5 block text-[12px] font-medium text-[#7186A0]">
              필수 및 선택 약관에 모두 동의합니다
            </span>
          </span>
        </button>

        <div class="h-px bg-[#F0F4F9]" />

        <!-- 개별 약관 -->
        <div v-if="terms.length > 0" class="divide-y divide-[#F0F4F9]">
          <div
            v-for="term in terms"
            :key="term.termId"
            class="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-[#FAFBFD]"
          >
            <button
              type="button"
              role="checkbox"
              :aria-checked="isAgreed(term.termId)"
              class="flex min-w-0 flex-1 items-center gap-3 text-left"
              @click="toggleTerm(term.termId)"
            >
              <span
                class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border-2 transition-colors"
                :class="isAgreed(term.termId) ? 'border-[#2878F0] bg-[#2878F0]' : 'border-[#B9C5D2] bg-white'"
              >
                <Check v-if="isAgreed(term.termId)" :size="14" :stroke-width="3.5" class="text-white" />
              </span>
              <span class="truncate text-[14px] font-semibold text-[#191F28]">
                {{ cleanTitle(term.title) }}
              </span>
            </button>
            <span
              class="shrink-0 text-[12px] font-semibold"
              :class="term.required ? 'text-red-500' : 'text-[#7186A0]'"
            >
              {{ term.required ? '필수' : '선택' }}
            </span>
            <button
              type="button"
              class="shrink-0 rounded-md px-1 py-0.5 text-[12px] font-semibold text-[#2878F0] transition-colors hover:text-[#1E68D6]"
              @click="selectedTerm = term"
            >
              보기
            </button>
          </div>
        </div>

        <!-- 약관 목록이 비어 있는 경우 -->
        <p v-else class="px-5 py-6 text-center text-[13px] font-medium text-[#7186A0]">
          약관 목록이 비어 있어요.
        </p>
      </section>
    </main>

    <!-- 하단: 다음 버튼 (온보딩 화면과 동일한 스타일) -->
    <footer
      class="shrink-0 flex flex-col items-center px-6 pt-3 pb-[max(env(safe-area-inset-bottom),28px)]"
    >
      <button
        type="button"
        class="w-full max-w-[340px] h-[54px] rounded-full bg-gradient-to-b from-[#3B9BE8] to-[#2878F0] text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(40,120,240,0.32)] transition-all duration-200 hover:brightness-105 active:scale-[0.98] active:brightness-95 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
        :disabled="!canProceed"
        @click="goNext"
      >
        다음
      </button>
    </footer>

    <!-- 약관 상세 다이얼로그 -->
    <Dialog :open="!!selectedTerm" @update:open="(open) => { if (!open) selectedTerm = null }">
      <DialogScrollContent class="max-w-[430px] rounded-2xl">
        <DialogHeader>
          <DialogTitle class="text-[16px] font-bold text-[#191F28]">
            {{ selectedTerm ? cleanTitle(selectedTerm.title) : '' }}
          </DialogTitle>
          <DialogDescription
            class="text-[12px] font-semibold"
            :class="selectedTerm?.required ? 'text-red-500' : 'text-[#7186A0]'"
          >
            {{ selectedTerm?.required ? '필수 동의 약관' : '선택 동의 약관' }}
          </DialogDescription>
        </DialogHeader>
        <div
          class="max-h-[55vh] overflow-y-auto whitespace-pre-line text-[13.5px] leading-relaxed text-[#3D4A5C]"
        >
          {{ selectedTerm?.content }}
        </div>
      </DialogScrollContent>
    </Dialog>
  </div>
</template>
