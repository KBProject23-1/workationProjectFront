<template>
  <div class="bg-canvas flex min-h-screen flex-col px-4 pt-4 pb-8">
    <header class="mb-4 flex items-center justify-center py-1">
      <h1 class="text-title font-bold -tracking-[0.01em] text-ink">
        워케이션 완료
      </h1>
    </header>

    <LoadingScreen
      v-if="loading"
      title="정산 정보를 불러오고 있어요"
      :fullscreen="false"
    />

    <template v-else>
      <!-- 완료를 알리는 화면이라 이 카드가 주인공이다 -->
      <section
        class="rounded-sheet bg-surface shadow-card mt-4 px-5 pt-9 pb-5 text-center"
      >
        <div class="relative mx-auto mb-5 h-16 w-16">
          <span
            class="bg-brand shadow-cta flex h-16 w-16 items-center justify-center rounded-full text-white"
          >
            <Check :size="32" :stroke-width="2.4" />
          </span>

          <!-- 완료 순간에 한 번만 터지는 장식. 클릭을 가로채지 않도록 pointer-events 를 끈다 -->
          <span
            v-for="piece in CONFETTI"
            :key="piece.id"
            class="confetti pointer-events-none absolute top-1/2 left-1/2 block h-1.5 w-1.5 rounded-[1px]"
            :style="{
              backgroundColor: piece.color,
              '--dx': piece.dx,
              '--dy': piece.dy,
              animationDelay: piece.delay,
            }"
          />
        </div>

        <h2 class="text-heading font-bold -tracking-[0.02em] text-ink">
          워케이션 일정이 완료되었습니다
        </h2>
        <p class="text-body-sm mt-2 text-ink-sub">
          정산 보고서는 기록에서 다시 볼 수 있어요
        </p>

        <div
          class="border-line text-body-sm mt-6 flex items-center justify-between border-t pt-4"
        >
          <span class="text-ink-mute">완료일시</span>
          <span class="font-bold text-ink">{{ settledAtText }}</span>
        </div>
      </section>

      <section class="mt-5">
        <h3 class="text-title mb-2.5 px-1 font-bold -tracking-[0.01em] text-ink">
          정산 요약
        </h3>
        <dl class="rounded-card bg-surface shadow-card px-[18px] py-2">
          <div class="border-line flex justify-between border-b py-3">
            <dt class="text-body-sm text-ink-sub">회사 청구</dt>
            <dd class="text-body-sm font-semibold text-ink">
              {{ won(workAmount) }}
            </dd>
          </div>
          <div class="border-line flex justify-between border-b py-3">
            <dt class="text-body-sm text-ink-sub">개인 부담</dt>
            <dd class="text-body-sm font-semibold text-ink">
              {{ won(personalAmount) }}
            </dd>
          </div>
          <div class="flex items-baseline justify-between py-3.5">
            <dt class="text-body font-bold text-ink">총 지출</dt>
            <dd class="text-title font-bold text-ink">
              {{ won(totalAmount) }}
            </dd>
          </div>
        </dl>
      </section>

      <BaseButton
        variant="default"
        class="mt-8 w-full"
        @click="goHome"
      >
        확인
      </BaseButton>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Check } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { storeToRefs } from 'pinia';
import { useSettlementStore } from '@/stores/settlementStore';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import { useErrorToast } from '@/composables/useErrorToast';
import { won } from '@/components/workation/format';

const route = useRoute();
const router = useRouter();
const settlementStore = useSettlementStore();
const { showError } = useErrorToast();

const workationId = route.params.workationId;

// 원 둘레로 흩어지도록 각도를 나눠 미리 계산해 둔다.
// 흰 카드 위에 뿌려지므로 밝은 색은 보이지 않는다
const CONFETTI_COLORS = ['#3087ED', '#0B3155', '#F2A007', '#8FD0FF', '#164B86'];

const CONFETTI = Array.from({ length: 14 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 14;
  const distance = 46 + (index % 3) * 12;
  return {
    id: index,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    dx: `${Math.round(Math.cos(angle) * distance)}px`,
    dy: `${Math.round(Math.sin(angle) * distance)}px`,
    delay: `${(index % 4) * 40}ms`,
  };
});

const loading = ref(true);
const { workation } = storeToRefs(settlementStore);

const amountOf = (budgetType) =>
  Number(settlementStore.summaryOf(budgetType).totalAmount ?? 0);

const workAmount = computed(() => amountOf('WORK'));
const personalAmount = computed(() => amountOf('PERSONAL'));
const totalAmount = computed(() => workAmount.value + personalAmount.value);

// 2026-07-31T18:25:00 -> 2026.07.31 18:25
const settledAtText = computed(() => {
  const value = workation.value?.settledAt;
  if (!value) return '-';
  const [date, time] = value.split('T');
  return `${date.replaceAll('-', '.')} ${(time ?? '').slice(0, 5)}`;
});

const loadSettlement = async () => {
  try {
    await settlementStore.fetchSettlement(workationId);
  } catch (error) {
    showError(error, '정산 결과를 불러오지 못했습니다.');
  } finally {
    loading.value = false;
  }
};

loadSettlement();

const goHome = () => {
  router.push('/workation');
};
</script>

<style scoped>
@keyframes confetti-burst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.4);
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy)))
      scale(1) rotate(220deg);
  }
}

.confetti {
  opacity: 0;
  animation: confetti-burst 900ms ease-out forwards;
}
</style>
