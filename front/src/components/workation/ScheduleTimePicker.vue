<template>
  <Dialog :open="visible" @update:open="handleOpenChange">
    <DialogContent :show-close-button="false" class="max-w-sm">
      <DialogHeader class="text-center">
        <DialogTitle>몇 시로 바꿀까요?</DialogTitle>
        <DialogDescription>{{ dotDate(date) }}</DialogDescription>
      </DialogHeader>

      <div class="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto py-1">
        <button
          v-for="time in TIME_OPTIONS"
          :key="time"
          class="rounded-lg border py-2 text-xs font-bold"
          :class="
            time === selected
              ? 'border-blue-600 bg-blue-50 text-blue-600'
              : 'border-slate-200 text-slate-600'
          "
          @click="selected = time"
        >
          {{ time }}
        </button>
      </div>

      <DialogFooter class="flex-row gap-2 sm:justify-center">
        <Button
          variant="outline"
          class="h-11 flex-1 rounded-xl"
          :disabled="loading"
          @click="$emit('cancel')"
        >
          취소
        </Button>
        <Button
          class="h-11 flex-1 rounded-xl"
          :disabled="loading || !selected"
          @click="$emit('confirm', selected)"
        >
          변경
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { dotDate } from './format';

// 일정은 30분 단위로 잡는다. 09:00 부터 자정 직전까지
const TIME_OPTIONS = [];
for (let hour = 9; hour < 24; hour++) {
  TIME_OPTIONS.push(`${String(hour).padStart(2, '0')}:00`);
  TIME_OPTIONS.push(`${String(hour).padStart(2, '0')}:30`);
}

const props = defineProps({
  visible: { type: Boolean, default: false },
  // 화면에 보여줄 날짜. 수정에서는 날짜를 바꾸지 않는다
  date: { type: String, default: '' },
  // 현재 시각. 열 때 이 값이 선택된 상태로 시작한다
  current: { type: String, default: '' },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(['confirm', 'cancel']);

const selected = ref(props.current);

// 다시 열 때 지난 선택이 남아 있으면 현재 시각과 어긋나 보인다
watch(
  () => props.visible,
  (opened) => {
    if (opened) selected.value = props.current;
  },
);

const handleOpenChange = (open) => {
  if (!open && !props.loading) emit('cancel');
};
</script>
