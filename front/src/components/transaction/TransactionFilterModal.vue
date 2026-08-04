<script setup>
import { ref, watch } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  modelValue: {
    type: Object,
    default: () => ({
      startDate: null,
      endDate: null,
      paymentSourceType: null,
      transactionType: null,
    }),
  },
});

const emit = defineEmits(['apply', 'close']);

const localFilters = ref({ ...props.modelValue });
const activePeriod = ref(null); // '1m' | '3m' | 'custom' | null

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      localFilters.value = { ...props.modelValue };
      activePeriod.value = null;
    }
  },
);

const periodPresets = [
  { label: '1개월', value: '1m', days: 30 },
  { label: '3개월', value: '3m', days: 90 },
];

function selectPeriod(preset) {
  activePeriod.value = preset.value;
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - preset.days);
  localFilters.value.startDate = start.toISOString().slice(0, 10);
  localFilters.value.endDate = end.toISOString().slice(0, 10);
}

function selectCustom() {
  activePeriod.value = 'custom';
}

function handleApply() {
  emit('apply', { ...localFilters.value });
}

function handleOpenChange(open) {
  if (!open) emit('close');
}
</script>

<template>
  <Dialog :open="visible" @update:open="handleOpenChange">
    <DialogContent class="max-w-sm">
      <DialogHeader>
        <DialogTitle>필터</DialogTitle>
      </DialogHeader>

      <div class="flex flex-col gap-4 py-2">
        <div>
          <p class="text-[13px] text-gray-500 mb-2 text-left">기간</p>
          <div class="flex gap-2 mb-3">
            <button
              v-for="preset in periodPresets"
              :key="preset.value"
              type="button"
              class="px-3 py-1.5 rounded-full border text-[13px]"
              :class="
                activePeriod === preset.value
                  ? 'bg-primary text-white border-primary'
                  : ''
              "
              @click="selectPeriod(preset)"
            >
              {{ preset.label }}
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-full border text-[13px]"
              :class="
                activePeriod === 'custom'
                  ? 'bg-primary text-white border-primary'
                  : ''
              "
              @click="selectCustom"
            >
              직접 선택
            </button>
          </div>

          <div v-if="activePeriod === 'custom'" class="flex items-center gap-2">
            <input
              v-model="localFilters.startDate"
              type="date"
              class="flex-1 border rounded-lg px-3 py-2 text-[13px]"
            />
            <span class="text-gray-400 text-[13px]">~</span>
            <input
              v-model="localFilters.endDate"
              type="date"
              class="flex-1 border rounded-lg px-3 py-2 text-[13px]"
            />
          </div>
        </div>

        <div>
          <p class="text-[13px] text-gray-500 mb-2 text-left">결제 수단</p>
          <div class="flex gap-2">
            <button
              type="button"
              class="px-3 py-1.5 rounded-full border text-[13px]"
              :class="
                !localFilters.paymentSourceType
                  ? 'bg-primary text-white border-primary'
                  : ''
              "
              @click="localFilters.paymentSourceType = null"
            >
              전체
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-full border text-[13px]"
              :class="
                localFilters.paymentSourceType === 'CARD'
                  ? 'bg-primary text-white border-primary'
                  : ''
              "
              @click="localFilters.paymentSourceType = 'CARD'"
            >
              카드
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-full border text-[13px]"
              :class="
                localFilters.paymentSourceType === 'WALLET'
                  ? 'bg-primary text-white border-primary'
                  : ''
              "
              @click="localFilters.paymentSourceType = 'WALLET'"
            >
              지갑
            </button>
          </div>
        </div>

        <div>
          <p class="text-[13px] text-gray-500 mb-2 text-left">거래 구분</p>
          <div class="flex gap-2 flex-wrap">
            <button
              type="button"
              class="px-3 py-1.5 rounded-full border text-[13px]"
              :class="
                !localFilters.transactionType
                  ? 'bg-primary text-white border-primary'
                  : ''
              "
              @click="localFilters.transactionType = null"
            >
              전체
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-full border text-[13px]"
              :class="
                localFilters.transactionType === 'PAYMENT'
                  ? 'bg-primary text-white border-primary'
                  : ''
              "
              @click="localFilters.transactionType = 'PAYMENT'"
            >
              결제
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-full border text-[13px]"
              :class="
                localFilters.transactionType === 'DEPOSIT'
                  ? 'bg-primary text-white border-primary'
                  : ''
              "
              @click="localFilters.transactionType = 'DEPOSIT'"
            >
              충전
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-full border text-[13px]"
              :class="
                localFilters.transactionType === 'WITHDRAWAL'
                  ? 'bg-primary text-white border-primary'
                  : ''
              "
              @click="localFilters.transactionType = 'WITHDRAWAL'"
            >
              환불
            </button>
          </div>
        </div>
      </div>

      <DialogFooter>
        <BaseButton class="w-full" @click="handleApply">적용하기</BaseButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
