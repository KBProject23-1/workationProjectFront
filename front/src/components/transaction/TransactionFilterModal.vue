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
import { toDateParam } from '@/utils/date';
import { CreditCard, ChevronRight } from '@lucide/vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  modelValue: {
    type: Object,
    default: () => ({
      startDate: null,
      endDate: null,
      paymentSourceType: null,
      cardId: null,
      transactionType: null,
    }),
  },

  cards: {
    type: Array,
    default: () => [],
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
  localFilters.value.startDate = toDateParam(start);
  localFilters.value.endDate = toDateParam(end);
}

function selectCustom() {
  activePeriod.value = 'custom';
}

// 결제 수단 변경 핸들러
function handlePaymentSourceChange(type) {
  localFilters.value.paymentSourceType = type;
  if (type !== 'CARD') {
    localFilters.value.cardId = null;
  }
}

function getSelectedCardName() {
  if (!localFilters.value.cardId) return '전체 카드';
  const card = props.cards.find(
    (c) => c.cardId === localFilters.value.cardId,
  );
  return card ? formatCardLabel(card) : '전체 카드';
}

function formatCardLabel(card) {
  const label = `${card.cardName} (${card.maskedNumber})`;
  return card.isDeleted ? `${label} - 연동 해제됨` : label;
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
        <!-- 기간 필터 -->
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

        <!-- 결제 수단 필터 -->
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
              @click="handlePaymentSourceChange(null)"
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
              @click="handlePaymentSourceChange('CARD')"
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
              @click="handlePaymentSourceChange('WALLET')"
            >
              지갑
            </button>
          </div>

          <!-- 세부 카드 선택 박스 -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div
              v-if="localFilters.paymentSourceType === 'CARD'"
              class="mt-3 relative"
            >
              <div
                class="flex items-center justify-between p-3 border rounded-2xl bg-white border-gray-200 shadow-sm hover:border-blue-300 transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary"
                  >
                    <CreditCard :size="20" />
                  </div>
                  <div class="text-left">
                    <p class="text-[13px] font-bold text-gray-800">
                      {{ getSelectedCardName() }}
                    </p>
                    <p
                      v-if="localFilters.cardId"
                      class="text-[11px] text-gray-400"
                    >
                      개별 카드 선택됨
                    </p>
                  </div>
                </div>
                <ChevronRight
                  :size="18"
                  class="text-gray-400 pointer-events-none"
                />
              </div>

              <select
                v-model="localFilters.cardId"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                <option :value="null">전체 카드</option>
                <option
                  v-for="card in cards"
                  :key="card.cardId"
                  :value="card.cardId"
                >
                  {{ formatCardLabel(card) }}
                </option>
              </select>
            </div>
          </Transition>
        </div>

        <!-- 거래 구분 필터 -->
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

      <DialogFooter class="mt-2">
        <BaseButton class="w-full" @click="handleApply">적용하기</BaseButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
