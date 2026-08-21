<script setup>
import { ref, watch } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import PinKeypad from '@/components/pin/PinKeypad.vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  amount: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
});

const emit = defineEmits(['close', 'submit']);
const pinNumber = ref('');

watch(
  () => props.open,
  (open) => {
    if (open) pinNumber.value = '';
  },
);

watch(
  () => props.error,
  (error) => {
    if (error) pinNumber.value = '';
  },
);

function handleOpenChange(open) {
  if (!open && !props.loading) emit('close');
}

function submit(pin) {
  if (!props.loading) emit('submit', pin);
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent
      :show-close-button="!loading"
      class="max-h-[calc(100vh-1rem)] max-w-sm overflow-y-auto rounded-3xl border-0 bg-[#f5f8fc] px-5 pb-6 pt-7"
      @escape-key-down="loading && $event.preventDefault()"
      @pointer-down-outside="loading && $event.preventDefault()"
    >
      <DialogTitle class="sr-only">결제 PIN 인증</DialogTitle>
      <DialogDescription class="sr-only">
        예약 결제를 위해 등록한 6자리 PIN 번호를 입력합니다.
      </DialogDescription>
      <PinKeypad
        v-model="pinNumber"
        title="결제 PIN을 입력해 주세요"
        :description="`${amount.toLocaleString('ko-KR')}원 결제를 인증합니다.`"
        :error="error"
        :disabled="loading"
        @complete="submit"
      />
      <p v-if="loading" class="mt-4 text-center text-body-sm font-semibold text-primary">
        예약과 결제를 처리하고 있어요.
      </p>
    </DialogContent>
  </Dialog>
</template>
