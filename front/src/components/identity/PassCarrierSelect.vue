<script setup>
// PASS 팝업 1 — 통신사 선택 + 약관 동의 (PASS1 레퍼런스)
// - 통신사(2x2) 선택 + 약관 전체 동의 시 'PASS로 인증하기' 버튼이 활성화된다.
// - '문자(SMS)로 인증하기' 버튼은 사용하지 않는다 (요구사항: 삭제).
// - 각 약관 제목을 누르면 약관 내용이 열린다 (내용은 비워 둠 — 준비 중).
import { computed, ref } from 'vue';
import { Check } from '@lucide/vue';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import PassLogo from './PassLogo.vue';

const emit = defineEmits(['confirm']);

// 통신사 목록 (이미지 에셋 없이 브랜드 컬러/텍스트로 표현)
const carriers = [
  { key: 'SKT', label: 'SK telecom', short: 'SK', color: '#E4141D' },
  { key: 'KT', label: 'kt', short: 'kt', color: '#111111' },
  { key: 'LGU', label: 'LG U+', short: 'LG U+', color: '#E44FA0' },
  { key: 'MVNO', label: '알뜰폰', short: '알뜰폰', color: '#2878F0' },
];

// 약관 목록 (내용은 비워 둠)
const termsList = [
  { key: 'privacy', title: '개인정보이용 동의' },
  { key: 'unique', title: '고유식별정보처리 동의' },
  { key: 'service', title: '서비스이용약관 동의' },
  { key: 'carrier', title: '통신사이용약관 동의' },
];

const selectedCarrier = ref('');
const agreedTermKeys = ref(new Set());
const selectedTerm = ref(null); // 약관 상세 다이얼로그 대상

const allAgreed = computed(() => termsList.every((term) => agreedTermKeys.value.has(term.key)));

// 통신사 선택 + 약관 전체 동의 시에만 활성화
const canProceed = computed(() => !!selectedCarrier.value && allAgreed.value);

function toggleAll() {
  agreedTermKeys.value = allAgreed.value
    ? new Set()
    : new Set(termsList.map((term) => term.key));
}

function toggleTerm(key) {
  const next = new Set(agreedTermKeys.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  agreedTermKeys.value = next;
}

function isAgreed(key) {
  return agreedTermKeys.value.has(key);
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <!-- 팝업 헤더: PASS 로고 -->
    <div class="shrink-0 border-b border-[#F0F4F9] px-6 py-4">
      <PassLogo />
    </div>

    <main class="flex-1 min-h-0 overflow-y-auto px-6 py-5">
      <h2 class="text-center text-[16px] font-bold tracking-tight text-[#191F28]">
        이용 중이신 통신사를<br class="sm:hidden" />선택해 주세요.
      </h2>

      <!-- 통신사 선택 (2x2) -->
      <div class="mx-auto mt-6 grid max-w-[300px] grid-cols-2 gap-3">
        <button
          v-for="carrier in carriers"
          :key="carrier.key"
          type="button"
          class="flex flex-col items-center gap-2 rounded-[18px] border-2 px-4 py-4 transition-all duration-150 active:scale-95"
          :class="
            selectedCarrier === carrier.key
              ? 'border-[#2878F0] bg-[#2878F0]/5 shadow-[0_4px_12px_rgba(40,120,240,0.15)]'
              : 'border-[#E3E9F0] bg-white hover:border-[#B9C5D2]'
          "
          @click="selectedCarrier = carrier.key"
        >
          <span
            class="flex h-12 w-12 items-center justify-center rounded-full text-[15px] font-extrabold"
            :style="{ color: carrier.color, backgroundColor: `${carrier.color}14` }"
          >
            {{ carrier.short }}
          </span>
          <span class="text-[12.5px] font-semibold text-[#3D4A5C]">{{ carrier.label }}</span>
        </button>
      </div>

      <!-- 약관 동의 -->
      <div class="mx-auto mt-8 max-w-[300px]">
        <!-- 전체 동의 -->
        <button
          type="button"
          role="checkbox"
          :aria-checked="allAgreed"
          class="flex w-full items-center gap-2.5 py-1 text-left"
          @click="toggleAll"
        >
          <span
            class="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[6px] border-2 transition-colors"
            :class="allAgreed ? 'border-[#2878F0] bg-[#2878F0]' : 'border-[#B9C5D2] bg-white'"
          >
            <Check v-if="allAgreed" :size="13" :stroke-width="3.5" class="text-white" />
          </span>
          <span class="text-[14px] font-bold text-[#191F28]">전체 동의</span>
        </button>

        <div class="my-2.5 h-px bg-[#F0F4F9]" />

        <!-- 개별 약관 (2x2) — 체크박스로 동의, 제목 클릭 시 약관 내용 열림 -->
        <div class="grid grid-cols-2 gap-x-2 gap-y-3">
          <div v-for="term in termsList" :key="term.key" class="flex items-center gap-1.5">
            <button
              type="button"
              role="checkbox"
              :aria-checked="isAgreed(term.key)"
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
              @click="toggleTerm(term.key)"
            >
              <span
                class="flex h-[20px] w-[20px] items-center justify-center rounded-[6px] border-2 transition-colors"
                :class="isAgreed(term.key) ? 'border-[#2878F0] bg-[#2878F0]' : 'border-[#B9C5D2] bg-white'"
              >
                <Check v-if="isAgreed(term.key)" :size="13" :stroke-width="3.5" class="text-white" />
              </span>
            </button>
            <button
              type="button"
              class="truncate text-left text-[12px] font-semibold text-[#7186A0] underline decoration-[#C7D6E8] underline-offset-2 transition-colors hover:text-[#3D4A5C]"
              @click="selectedTerm = term"
            >
              {{ term.title }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 하단: PASS로 인증하기 (통신사 + 전체 동의 시 활성화) -->
    <footer class="shrink-0 px-6 pt-3 pb-[max(env(safe-area-inset-bottom),20px)]">
      <button
        type="button"
        class="w-full h-[52px] rounded-full text-[15px] font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
        :class="
          canProceed
            ? 'bg-gradient-to-b from-[#3B9BE8] to-[#2878F0] text-white shadow-[0_10px_24px_rgba(40,120,240,0.32)] hover:brightness-105'
            : 'bg-[#E8EDF3] text-[#98A8B8]'
        "
        :disabled="!canProceed"
        @click="emit('confirm')"
      >
        PASS로 인증하기
      </button>
    </footer>

    <!-- 약관 상세 다이얼로그 (내용은 비워 둠) -->
    <Dialog :open="!!selectedTerm" @update:open="(open) => { if (!open) selectedTerm = null }">
      <DialogContent class="max-w-[430px] rounded-2xl">
        <DialogTitle class="text-[16px] font-bold text-[#191F28]">
          {{ selectedTerm?.title || '' }}
        </DialogTitle>
        <div
          class="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-[#DFE7F0] bg-[#FAFBFD] py-10"
        >
          <p class="text-[12.5px] font-medium text-[#98A8B8]">
            약관 내용이 준비 중입니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
