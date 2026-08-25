<script setup>
import { ref, computed, watch } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
// shadcn 래퍼의 SelectTrigger는 as-child든 아니든 ChevronDown을 슬롯 옆에 같이 렌더링해서
// 완전 커스텀 트리거를 asChild로 쓸 땐 그 아이콘이 병합 안 되고 형제 요소로 남는다.
// 여기선 커스텀 버튼만 렌더링하는 Reka UI 원본 SelectTrigger를 직접 쓴다.
import { SelectTrigger } from 'reka-ui';
import BaseButton from '@/components/common/BaseButton.vue';
import { toDateParam } from '@/utils/date';
import { formatCardNumber } from '@/utils/card';
import { CreditCard, ChevronRight } from '@lucide/vue';

const ALL_CARDS = 'ALL';

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

const periodPresets = [
  { label: '1개월', value: '1m', days: 30 },
  { label: '3개월', value: '3m', days: 90 },
];

// 현재 필터의 기간이 프리셋 중 하나와 일치하면 그 버튼을 활성화 표시, 아니면 직접 선택으로 취급
function detectActivePeriod(filters) {
  const end = new Date();
  const matched = periodPresets.find((preset) => {
    const start = new Date();
    start.setDate(start.getDate() - preset.days);
    return (
      filters.startDate === toDateParam(start) &&
      filters.endDate === toDateParam(end)
    );
  });
  if (matched) return matched.value;
  return filters.startDate || filters.endDate ? 'custom' : null;
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      localFilters.value = { ...props.modelValue };
      activePeriod.value = detectActivePeriod(localFilters.value);
    }
  },
);

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

function handlePaymentSourceChange(type) {
  localFilters.value.paymentSourceType = type;
  if (type !== 'CARD') {
    localFilters.value.cardId = null;
  }
}

function getSelectedCardName() {
  if (!localFilters.value.cardId) return '전체 카드';
  const card = props.cards.find((c) => c.cardId === localFilters.value.cardId);
  return card ? formatCardLabel(card) : '전체 카드';
}

const cardSelectValue = computed({
  get: () => localFilters.value.cardId ?? ALL_CARDS,
  set: (value) => {
    localFilters.value.cardId = value === ALL_CARDS ? null : value;
  },
});

function formatCardLabel(card) {
  const label = `${card.cardName} (${formatCardNumber(card.maskedNumber)})`;
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
    <DialogContent
      class="max-w-sm rounded-[24px] p-5 bg-white border border-line shadow-2xl text-left"
    >
      <DialogHeader class="mb-2">
        <DialogTitle class="text-title font-bold text-ink text-left"
          >거래내역 필터</DialogTitle
        >
      </DialogHeader>

      <div class="flex flex-col gap-5 py-1">
        <div>
          <p class="text-body-sm font-semibold text-ink-sub mb-2">조회 기간</p>
          <div class="flex gap-1.5 mb-2.5">
            <button
              v-for="preset in periodPresets"
              :key="preset.value"
              type="button"
              class="px-3.5 py-2 rounded-card text-body-sm font-bold transition-all active:scale-95"
              :class="
                activePeriod === preset.value
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-canvas/80 text-ink-sub hover:bg-gray-200/60'
              "
              @click="selectPeriod(preset)"
            >
              {{ preset.label }}
            </button>
            <button
              type="button"
              class="px-3.5 py-2 rounded-card text-body-sm font-bold transition-all active:scale-95"
              :class="
                activePeriod === 'custom'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-canvas/80 text-ink-sub hover:bg-gray-200/60'
              "
              @click="selectCustom"
            >
              직접 선택
            </button>
          </div>

          <div
            v-if="activePeriod === 'custom'"
            class="flex items-center gap-2 pt-1"
          >
            <input
              v-model="localFilters.startDate"
              type="date"
              class="flex-1 border border-line rounded-card px-3 py-2 text-body-sm font-medium text-ink focus:outline-hidden focus:border-brand bg-canvas/50"
            />
            <span class="text-ink-sub text-body-sm font-bold">~</span>
            <input
              v-model="localFilters.endDate"
              type="date"
              class="flex-1 border border-line rounded-card px-3 py-2 text-body-sm font-medium text-ink focus:outline-hidden focus:border-brand bg-canvas/50"
            />
          </div>
        </div>

        <div>
          <p class="text-body-sm font-semibold text-ink-sub mb-2">결제 수단</p>
          <div class="flex gap-1.5">
            <button
              type="button"
              class="px-3.5 py-2 rounded-card text-body-sm font-bold transition-all active:scale-95"
              :class="
                !localFilters.paymentSourceType
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-canvas/80 text-ink-sub hover:bg-gray-200/60'
              "
              @click="handlePaymentSourceChange(null)"
            >
              전체
            </button>
            <button
              type="button"
              class="px-3.5 py-2 rounded-card text-body-sm font-bold transition-all active:scale-95"
              :class="
                localFilters.paymentSourceType === 'CARD'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-canvas/80 text-ink-sub hover:bg-gray-200/60'
              "
              @click="handlePaymentSourceChange('CARD')"
            >
              카드
            </button>
            <button
              type="button"
              class="px-3.5 py-2 rounded-card text-body-sm font-bold transition-all active:scale-95"
              :class="
                localFilters.paymentSourceType === 'WALLET'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-canvas/80 text-ink-sub hover:bg-gray-200/60'
              "
              @click="handlePaymentSourceChange('WALLET')"
            >
              지갑
            </button>
          </div>

          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div
              v-if="localFilters.paymentSourceType === 'CARD'"
              class="mt-2.5"
            >
              <Select v-model="cardSelectValue">
                <SelectTrigger as-child>
                  <button
                    type="button"
                    class="flex items-center justify-between w-full p-3 rounded-sheet bg-canvas/80 border border-line hover:bg-canvas/60 transition-colors cursor-pointer text-left"
                  >
                    <div class="flex items-center gap-2.5">
                      <div
                        class="w-8 h-8 rounded-chip bg-white border border-line flex items-center justify-center text-brand shadow-xs"
                      >
                        <CreditCard :size="16" />
                      </div>
                      <div>
                        <p class="text-body-sm font-bold text-ink">
                          {{ getSelectedCardName() }}
                        </p>
                      </div>
                    </div>
                    <ChevronRight :size="16" class="text-ink-sub" />
                  </button>
                </SelectTrigger>
                <SelectContent
                  class="rounded-sheet border border-line bg-white p-1 shadow-xl"
                >
                  <SelectItem
                    :value="ALL_CARDS"
                    class="rounded-card text-body-sm font-medium py-2"
                  >
                    전체 카드
                  </SelectItem>
                  <SelectItem
                    v-for="card in cards"
                    :key="card.cardId"
                    :value="card.cardId"
                    class="rounded-card text-body-sm font-medium py-2"
                  >
                    {{ formatCardLabel(card) }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Transition>
        </div>

        <div>
          <p class="text-body-sm font-semibold text-ink-sub mb-2">거래 유형</p>
          <div class="flex gap-1.5 flex-wrap">
            <button
              type="button"
              class="px-3.5 py-2 rounded-card text-body-sm font-bold transition-all active:scale-95"
              :class="
                !localFilters.transactionType
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-canvas/80 text-ink-sub hover:bg-gray-200/60'
              "
              @click="localFilters.transactionType = null"
            >
              전체
            </button>
            <button
              type="button"
              class="px-3.5 py-2 rounded-card text-body-sm font-bold transition-all active:scale-95"
              :class="
                localFilters.transactionType === 'PAYMENT'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-canvas/80 text-ink-sub hover:bg-gray-200/60'
              "
              @click="localFilters.transactionType = 'PAYMENT'"
            >
              결제
            </button>
            <button
              type="button"
              class="px-3.5 py-2 rounded-card text-body-sm font-bold transition-all active:scale-95"
              :class="
                localFilters.transactionType === 'DEPOSIT'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-canvas/80 text-ink-sub hover:bg-gray-200/60'
              "
              @click="localFilters.transactionType = 'DEPOSIT'"
            >
              충전
            </button>
            <button
              type="button"
              class="px-3.5 py-2 rounded-card text-body-sm font-bold transition-all active:scale-95"
              :class="
                localFilters.transactionType === 'WITHDRAWAL'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-canvas/80 text-ink-sub hover:bg-gray-200/60'
              "
              @click="localFilters.transactionType = 'WITHDRAWAL'"
            >
              환불
            </button>
          </div>
        </div>
      </div>

      <DialogFooter class="mt-4">
        <BaseButton
          class="w-full"
          @click="handleApply"
        >
          적용하기
        </BaseButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
