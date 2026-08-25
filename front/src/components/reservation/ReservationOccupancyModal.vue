<script setup>
import { Minus, Plus, X } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';

// 숙소는 객실 수, 공유오피스는 공간 수를 인원과 함께 고른다.
// 세는 대상만 다르고 화면은 같아서 이름만 밖에서 받는다
const props = defineProps({
  roomCount: { type: Number, required: true },
  guestCount: { type: Number, required: true },
  unitLabel: { type: String, default: '객실' },
  unitSuffix: { type: String, default: '개' },
  maxUnit: { type: Number, default: 5 },
  maxGuest: { type: Number, default: 10 },
});

const emit = defineEmits(['close', 'update:roomCount', 'update:guestCount']);

const changeRoomCount = (amount) => {
  emit(
    'update:roomCount',
    Math.min(props.maxUnit, Math.max(1, props.roomCount + amount)),
  );
};

const changeGuestCount = (amount) => {
  emit(
    'update:guestCount',
    Math.min(props.maxGuest, Math.max(1, props.guestCount + amount)),
  );
};
</script>

<template>
  <div
    class="bg-navy/45 fixed inset-0 z-50 flex items-end justify-center"
    @click.self="emit('close')"
  >
    <section
      class="rounded-t-sheet bg-surface w-full max-w-[430px] px-5 pt-5 pb-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="occupancy-title"
    >
      <span class="bg-line mx-auto mb-4 block h-1 w-9 rounded-full" />

      <div class="flex items-center justify-between gap-3">
        <h2
          id="occupancy-title"
          class="text-title font-bold -tracking-[0.01em] text-ink"
        >
          {{ unitLabel }} · 인원 선택
        </h2>
        <button
          type="button"
          class="bg-canvas flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-sub"
          aria-label="닫기"
          @click="emit('close')"
        >
          <X :size="16" />
        </button>
      </div>

      <div class="border-line flex items-center justify-between border-b py-5">
        <div>
          <p class="text-body font-semibold text-ink">{{ unitLabel }}</p>
          <p class="text-body-sm mt-0.5 text-ink-mute">
            최대 {{ maxUnit }}{{ unitSuffix }}까지 고를 수 있어요
          </p>
        </div>
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="border-line flex h-9 w-9 items-center justify-center rounded-full border text-ink disabled:text-ink-mute"
            :aria-label="`${unitLabel} 줄이기`"
            :disabled="roomCount === 1"
            @click="changeRoomCount(-1)"
          >
            <Minus :size="16" />
          </button>
          <span class="text-title w-5 text-center font-bold text-ink">
            {{ roomCount }}
          </span>
          <button
            type="button"
            class="border-line flex h-9 w-9 items-center justify-center rounded-full border text-ink disabled:text-ink-mute"
            :aria-label="`${unitLabel} 늘리기`"
            :disabled="roomCount === maxUnit"
            @click="changeRoomCount(1)"
          >
            <Plus :size="16" />
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between py-5">
        <div>
          <p class="text-body font-semibold text-ink">인원</p>
          <p class="text-body-sm mt-0.5 text-ink-mute">
            최대 {{ maxGuest }}명까지 고를 수 있어요
          </p>
        </div>
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="border-line flex h-9 w-9 items-center justify-center rounded-full border text-ink disabled:text-ink-mute"
            aria-label="인원 줄이기"
            :disabled="guestCount === 1"
            @click="changeGuestCount(-1)"
          >
            <Minus :size="16" />
          </button>
          <span class="text-title w-5 text-center font-bold text-ink">
            {{ guestCount }}
          </span>
          <button
            type="button"
            class="border-line flex h-9 w-9 items-center justify-center rounded-full border text-ink disabled:text-ink-mute"
            aria-label="인원 늘리기"
            :disabled="guestCount === maxGuest"
            @click="changeGuestCount(1)"
          >
            <Plus :size="16" />
          </button>
        </div>
      </div>

      <BaseButton class="mt-2" @click="emit('close')">선택 완료</BaseButton>
    </section>
  </div>
</template>
