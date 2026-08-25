<template>
  <!-- 남색 헤더 위로 올라오는 카드. 흰 면이라야 헤더와 경계가 분명해진다 -->
  <div class="rounded-sheet bg-surface shadow-card relative px-[18px] py-[18px]">
    <div class="mb-2.5 flex items-start justify-between">
      <span
        class="text-caption rounded-chip px-2.5 py-1 font-bold"
        :class="phaseClass"
      >
        {{ phaseText }}
      </span>

      <div class="flex items-center gap-1">
        <span
          class="text-body-sm rounded-full px-3 py-1 font-bold text-white"
          :class="pending ? 'bg-ink-sub' : 'bg-brand'"
        >
          {{ ddayText }}
        </span>

        <div class="relative">
          <button
            class="flex h-7 w-7 items-center justify-center text-ink-mute"
            aria-label="더보기"
            @click.stop="menuOpen = !menuOpen"
          >
            <MoreHorizontal :size="18" />
          </button>

          <div
            v-if="menuOpen"
            class="rounded-card shadow-float bg-surface absolute top-8 right-0 z-10 w-36 overflow-hidden"
          >
            <button
              class="text-body-sm w-full px-3.5 py-2.5 text-left font-semibold text-ink"
              @click="select('edit')"
            >
              일정 수정
            </button>
            <button
              class="text-body-sm border-line w-full border-t px-3.5 py-2.5 text-left font-semibold text-ink"
              @click="select('budget')"
            >
              예산 수정
            </button>
            <button
              class="text-body-sm border-line text-danger w-full border-t px-3.5 py-2.5 text-left font-semibold"
              @click="select('delete')"
            >
              일정 삭제
            </button>
          </div>
        </div>
      </div>
    </div>

    <h2 class="text-heading font-bold -tracking-[0.02em] text-ink">
      {{ workation.title }}
    </h2>

    <p class="text-body-sm mt-1 text-ink-sub">
      {{ dotDate(workation.startDate) }} ~ {{ dotDate(workation.endDate) }}
    </p>

    <div class="bg-canvas mt-4 h-1.5 w-full rounded-full">
      <div
        class="bg-brand h-1.5 rounded-full"
        :style="{ width: barWidth + '%' }"
      />
    </div>

    <div class="text-body-sm mt-2 flex justify-between text-ink-mute">
      <span>{{ progressText }}</span>
      <span>{{ remainText }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { MoreHorizontal } from '@lucide/vue';
import { dotDate } from './format';

const props = defineProps({
  workation: { type: Object, required: true },
});

const emit = defineEmits(['budget', 'edit', 'delete']);

const menuOpen = ref(false);

const close = () => {
  menuOpen.value = false;
};

// 카드 밖을 누르면 메뉴를 닫는다
onMounted(() => document.addEventListener('click', close));
onBeforeUnmount(() => document.removeEventListener('click', close));

const select = (action) => {
  menuOpen.value = false;
  emit(action);
};

// 서버가 내려주는 phase 는 BEFORE / ONGOING / PENDING_SETTLEMENT 세 가지다
const phase = computed(() => props.workation.phase ?? 'ONGOING');
const before = computed(() => phase.value === 'BEFORE');
const pending = computed(() => phase.value === 'PENDING_SETTLEMENT');

const phaseText = computed(() => {
  if (before.value) return '시작 전';
  if (pending.value) return '정산 대기';
  return '진행 중';
});

const phaseClass = computed(() =>
  pending.value ? 'bg-canvas text-ink-sub' : 'bg-brand-weak text-brand',
);

// 예산처럼 100 을 넘길 일은 없지만, 값이 어긋나도 막대가 카드를 벗어나지 않게 자른다
const barWidth = computed(() =>
  Math.min(Math.max(props.workation.progressRate ?? 0, 0), 100),
);

// 종료일이 지난 뒤에는 서버가 dday 를 0 으로 내려주므로 경과일을 직접 센다
const daysSinceEnd = computed(() => {
  const end = new Date(props.workation.endDate);
  const today = new Date();
  return Math.max(Math.floor((today - end) / (1000 * 60 * 60 * 24)), 0);
});

const ddayText = computed(() => {
  if (pending.value) return `D+${daysSinceEnd.value}`;
  const dday = props.workation.dday ?? 0;
  return dday === 0 ? 'D-DAY' : `D-${dday}`;
});

const progressText = computed(() => {
  if (before.value) return `전체 ${props.workation.totalDays}일`;
  return `전체 ${props.workation.totalDays}일 · ${props.workation.elapsedDays}일째`;
});

// 남은 일수는 위 D-day 배지와 같은 말이라 적지 않는다.
// 정산 안내는 배지로 알 수 없는 내용이라 남긴다
const remainText = computed(() => (pending.value ? '정산이 필요해요' : ''));
</script>
