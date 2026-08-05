<template>
  <div class="min-h-screen bg-white px-5 pt-4 pb-8">
    <header class="relative mb-4 flex items-center justify-center">
      <h1 class="text-base font-bold text-slate-900">워케이션 완료</h1>
    </header>

    <p v-if="loading" class="py-20 text-center text-sm text-slate-400">
      불러오는 중...
    </p>

    <template v-else>
      <section class="mt-6 rounded-2xl bg-blue-50 px-5 py-8 text-center">
        <div class="relative mx-auto mb-4 h-16 w-16">
          <span
            class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-3xl text-white"
          >
            ✓
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

        <h2 class="text-lg font-bold text-slate-900">
          워케이션 일정이 완료되었습니다!
        </h2>
        <p class="mt-2 text-sm text-slate-500">
          정산 보고서는 기록에서 다시 볼 수 있어요
        </p>

        <div
          class="mt-5 flex items-center justify-between border-t border-blue-100 pt-4 text-sm"
        >
          <span class="text-slate-500">완료일시</span>
          <span class="font-bold text-slate-900">{{ settledAtText }}</span>
        </div>
      </section>

      <section class="mt-6">
        <h3 class="mb-2 text-sm font-bold text-slate-900">정산 요약</h3>
        <dl class="rounded-xl border border-slate-200 px-4 py-3 text-sm">
          <div class="flex justify-between py-1.5">
            <dt class="text-slate-500">법인 청구</dt>
            <dd class="font-bold text-slate-900">{{ won(workAmount) }}</dd>
          </div>
          <div class="flex justify-between py-1.5">
            <dt class="text-slate-500">개인 부담</dt>
            <dd class="font-bold text-slate-900">{{ won(personalAmount) }}</dd>
          </div>
          <div
            class="mt-1 flex justify-between border-t border-slate-100 pt-2.5"
          >
            <dt class="font-bold text-slate-900">총 지출</dt>
            <dd class="font-bold text-slate-900">{{ won(totalAmount) }}</dd>
          </div>
        </dl>
      </section>

      <Button class="mt-8 h-12 w-full rounded-xl text-base" @click="goHome"
        >확인</Button
      >
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { storeToRefs } from 'pinia';
import { useSettlementStore } from '@/stores/settlementStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { won } from '@/components/workation/format';

const route = useRoute();
const router = useRouter();
const settlementStore = useSettlementStore();
const { showError } = useErrorToast();

const workationId = route.params.workationId;

// 원 둘레로 흩어지도록 각도를 나눠 미리 계산해 둔다
const CONFETTI_COLORS = ['#2563EB', '#60A5FA', '#F59E0B', '#EF4444', '#10B981'];

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
