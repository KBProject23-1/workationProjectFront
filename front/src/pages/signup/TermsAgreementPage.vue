<script setup>
// 회원가입 약관 동의 화면
// - GET /api/v1/auth/terms (docs: 약관 목록 데이터 조회) 응답을 렌더링한다.
// - BE 약관 API가 아직 미구현이라(docs: 시작 전) 실패 시 샘플 데이터로 폴백한다.
// - 전체 동의 / 개별 동의 상태를 동기화하고, 필수 약관이 모두 동의된 경우에만 '다음' 버튼을 활성화한다.
// - '다음' 클릭 시 본인인증 화면으로 이동하는 연결은 회원가입 프로세스 통합 작업에서 진행한다.
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Check, ChevronLeft } from '@lucide/vue';
import { toast } from 'vue-sonner';
import { getTerms } from '@/api/auth';
import {
  Dialog,
  DialogScrollContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const router = useRouter();

// docs '약관 목록 데이터 조회' 예시 응답과 동일한 구조의 샘플 데이터 (BE 연동 전 폴백용)
const FALLBACK_TERMS = [
  {
    termId: 1,
    title: '서비스 이용약관 (필수)',
    content: `제1조 (목적)
본 약관은 Workit(이하 "회사")이 제공하는 워케이션 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 회원 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (약관의 효력 및 변경)
① 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.
② 회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있으며, 개정된 약관은 공지된 시점부터 효력이 발생합니다.

제3조 (회원의 의무)
① 회원은 서비스 이용 시 본 약관 및 관련 법령을 준수하여야 합니다.
② 회원은 타인의 개인정보를 도용하거나 서비스의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.`,
    required: true,
  },
  {
    termId: 2,
    title: '개인정보 수집 및 이용동의 (필수)',
    content: `1. 수집 항목
- 필수: 이름, 휴대폰 번호, 이메일(로그인 ID)
- 선택: 생년월일, 프로필 사진

2. 수집·이용 목적
- 회원 가입 및 서비스 제공
- 본인 인증 및 계정 관리
- 서비스 개선 및 맞춤형 정보 제공

3. 보유 및 이용 기간
- 회원 탈퇴 시까지 또는 관련 법령이 정한 보존 기간`,
    required: true,
  },
  {
    termId: 3,
    title: '마케팅 정보 수신 및 활용 동의 (선택)',
    content: `이벤트 및 혜택 안내, 신규 서비스 소개, 맞춤형 광고 등 마케팅 정보를 이메일, 문자(SMS), 앱 푸시로 수신하는 것에 동의합니다.

- 동의하지 않으셔도 기본 서비스 이용에는 제한이 없습니다.
- 수신 동의는 언제든지 철회할 수 있습니다.`,
    required: false,
  },
];

const terms = ref([]);
const loading = ref(true);
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
  // TODO: 다음 단계(본인인증) 화면으로의 Router 연결은 회원가입 프로세스 통합 작업에서 진행한다.
  toast.info('다음 단계(본인인증) 화면은 회원가입 통합 작업에서 연결될 예정이에요.');
}

onMounted(async () => {
  try {
    const { data } = await getTerms();
    terms.value = data?.termsList ?? FALLBACK_TERMS;
  } catch {
    // BE 미구현으로 조회 실패 시 샘플 데이터 사용 (독립 테스트 가능하도록)
    terms.value = FALLBACK_TERMS;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="flex flex-col h-dvh bg-white overflow-hidden">
    <!-- 헤더 -->
    <header class="shrink-0 flex items-center gap-1 px-2 pt-2">
      <button
        type="button"
        aria-label="뒤로 가기"
        class="flex h-10 w-10 items-center justify-center rounded-full text-[#0B3155] transition-colors hover:bg-[#F5F8FC] active:scale-95"
        @click="goBack"
      >
        <ChevronLeft :size="24" :stroke-width="2.5" />
      </button>
      <h1 class="text-[17px] font-bold tracking-tight text-[#191F28]">약관동의</h1>
    </header>

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
