<script setup>
import { ref, watch } from 'vue';
import { formatCardNumber, cardGradient } from '@/utils/card';
import { Edit3 } from '@lucide/vue';

const props = defineProps({
  card: { type: Object, required: true },
});

const emit = defineEmits(['update']);

const nickname = ref(props.card.cardName);

// 사용자가 아무것도 안 건드리고 바로 저장해도 부모가 현재 별칭을 알 수 있도록 마운트 시점에도 emit
watch(
  nickname,
  (value) => {
    emit('update', value);
  },
  { immediate: true },
);
</script>

<template>
  <div class="w-full text-left">
    <!-- 카드 미리보기: WalletHome 카드 캐러셀과 동일한 모양 -->
    <div class="flex flex-col items-center mb-6">
      <div
        class="relative rounded-[20px] text-white p-5 overflow-hidden shadow-[0_12px_24px_-6px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)]"
        :style="{
          background: cardGradient(card),
          width: '15rem',
          height: '9.2rem',
        }"
      >
        <div
          class="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"
        />

        <div class="flex items-start justify-between relative z-10">
          <div
            class="w-9 h-6 rounded-chip bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 p-[1px] shadow-inner relative overflow-hidden"
          >
            <div
              class="w-full h-full border border-amber-800/20 rounded-[5px] grid grid-cols-2 gap-0.5 p-0.5 opacity-60"
            >
              <div class="border-r border-b border-amber-900/30"></div>
              <div class="border-b border-amber-900/30"></div>
              <div class="border-r border-amber-900/30"></div>
              <div></div>
            </div>
          </div>
        </div>

        <div class="flex items-end justify-between gap-1 relative z-10">
          <div class="flex flex-col min-w-0 flex-1">
            <span
              class="text-caption font-medium text-white/75 tracking-wider uppercase truncate"
            >
              {{ card.cardCompanyName || card.cardName }}
            </span>
            <span
              class="text-body-sm font-bold tracking-widest text-white/95 whitespace-nowrap mt-0.5"
            >
              {{ formatCardNumber(card.maskedNumber) }}
            </span>
          </div>
        </div>
      </div>

      <p
        class="text-body font-bold text-ink mt-3 truncate max-w-[15rem]"
      >
        {{ nickname || card.cardName }}
      </p>
    </div>

    <!-- 별칭 입력 폼 -->
    <div class="space-y-2">
      <label class="block text-body-sm font-semibold text-ink-sub">
        카드 별칭 설정
      </label>
      <div class="relative flex items-center">
        <input
          v-model="nickname"
          type="text"
          maxlength="100"
          placeholder="예: 여행경비 카드, 생활비 카드"
          class="w-full bg-canvas/80 border border-line focus:border-brand focus:bg-white focus:outline-hidden rounded-sheet px-4 py-3.5 text-body font-medium text-ink placeholder:text-ink-sub transition-all"
        />
        <div class="absolute right-4 text-ink-sub pointer-events-none">
          <Edit3 :size="16" />
        </div>
      </div>
      <p class="text-caption text-ink-sub pl-1">
        나만의 별칭을 정해두면 거래 내역에서 쉽게 알아볼 수 있어요.
      </p>
    </div>
  </div>
</template>
