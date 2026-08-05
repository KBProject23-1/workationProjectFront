<template>
  <div class="relative rounded-2xl bg-blue-50 px-4 py-4">
    <div class="mb-2 flex items-start justify-between">
      <span
        class="rounded-md bg-white px-2 py-1 text-[11px] font-semibold"
        :class="phaseClass"
      >
        {{ phaseText }}
      </span>

      <div class="flex items-center gap-1">
        <span
          class="rounded-full px-3 py-1 text-xs font-bold text-white"
          :class="pending ? 'bg-slate-500' : 'bg-blue-600'"
        >
          {{ ddayText }}
        </span>

        <div class="relative">
          <button
            class="flex h-6 w-6 items-center justify-center text-slate-400"
            aria-label="더보기"
            @click.stop="menuOpen = !menuOpen"
          >
            ⋯
          </button>

          <div
            v-if="menuOpen"
            class="absolute top-7 right-0 z-10 w-28 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md"
          >
            <button
              class="w-full px-3 py-2 text-left text-xs text-slate-700"
              @click="select('edit')"
            >
              일정 수정
            </button>
            <button
              class="w-full border-t border-slate-100 px-3 py-2 text-left text-xs text-red-500"
              @click="select('delete')"
            >
              일정 삭제
            </button>
          </div>
        </div>
      </div>
    </div>

    <h2 class="text-xl font-bold text-slate-900">{{ workation.title }}</h2>

    <p class="mt-1 text-xs text-slate-500">
      {{ dotDate(workation.startDate) }} ~ {{ dotDate(workation.endDate) }}
    </p>

    <div class="mt-3 h-1.5 w-full rounded-full bg-blue-200">
      <div
        class="h-1.5 rounded-full bg-blue-600"
        :style="{ width: workation.progressRate + '%' }"
      />
    </div>

    <div class="mt-2 flex justify-between text-xs text-slate-500">
      <span>{{ progressText }}</span>
      <span>{{ remainText }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { dotDate } from './format';

const props = defineProps({
  workation: { type: Object, required: true },
});

const emit = defineEmits(['edit', 'delete']);

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
  pending.value ? 'text-slate-500' : 'text-blue-600',
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

const remainText = computed(() => {
  if (before.value) return `시작까지 ${props.workation.dday ?? 0}일`;
  if (pending.value) return '정산이 필요해요';
  return `${props.workation.dday ?? 0}일 남음`;
});
</script>
