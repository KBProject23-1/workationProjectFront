<script setup>
import { Check, CreditCard, WalletCards } from '@lucide/vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCardNumber } from '@/utils/card';

defineProps({
  open: { type: Boolean, default: false },
  cards: { type: Array, default: () => [] },
  walletBalance: { type: Number, default: 0 },
  walletAvailable: { type: Boolean, default: false },
  selectedPaymentSourceType: { type: String, default: 'CARD' },
  selectedCardId: { type: Number, default: null },
  cardLoading: { type: Boolean, default: false },
  walletLoading: { type: Boolean, default: false },
  cardError: { type: String, default: '' },
  walletError: { type: String, default: '' },
});

const emit = defineEmits([
  'close',
  'select-card',
  'select-wallet',
  'retry-cards',
  'retry-wallet',
]);

function handleOpenChange(open) {
  if (!open) emit('close');
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-h-[calc(100vh-2rem)] max-w-sm overflow-y-auto rounded-2xl border-0 px-5 pb-6 pt-7">
      <DialogTitle class="text-[20px] font-extrabold text-slate-900">
        결제 수단 변경
      </DialogTitle>
      <DialogDescription class="text-[13px] text-slate-500">
        결제에 사용할 Wallet 또는 카드를 선택해 주세요.
      </DialogDescription>

      <section>
        <h3 class="mb-2 text-[12px] font-bold text-slate-400">Wallet</h3>
        <div v-if="walletLoading" class="h-20 animate-pulse rounded-xl bg-slate-100"></div>
        <div v-else-if="walletError" class="rounded-xl bg-rose-50 px-4 py-4">
          <p class="text-[12px] font-semibold text-rose-600">Wallet 잔액을 불러오지 못했어요.</p>
          <button type="button" class="mt-2 text-[12px] font-bold text-primary" @click="emit('retry-wallet')">
            다시 시도
          </button>
        </div>
        <button
          v-else
          type="button"
          class="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          :class="selectedPaymentSourceType === 'WALLET' ? 'border-primary bg-blue-50' : 'border-slate-200 bg-white'"
          :disabled="!walletAvailable"
          @click="emit('select-wallet')"
        >
          <span class="grid size-10 shrink-0 place-items-center rounded-full bg-blue-100 text-primary">
            <WalletCards :size="21" />
          </span>
          <span class="min-w-0 flex-1">
            <strong class="block text-[14px] text-slate-800">워크페이 Wallet</strong>
            <span class="mt-1 block text-[12px] text-slate-500">
              잔액 {{ walletBalance.toLocaleString('ko-KR') }}원
            </span>
          </span>
          <Check v-if="selectedPaymentSourceType === 'WALLET'" class="shrink-0 text-primary" :size="20" :stroke-width="3" />
        </button>
      </section>

      <section>
        <h3 class="mb-2 text-[12px] font-bold text-slate-400">등록 카드</h3>
        <div v-if="cardLoading" class="space-y-2">
          <div v-for="index in 2" :key="index" class="h-20 animate-pulse rounded-xl bg-slate-100"></div>
        </div>
        <div v-else-if="cardError" class="rounded-xl bg-rose-50 px-4 py-4">
          <p class="text-[12px] font-semibold text-rose-600">카드 목록을 불러오지 못했어요.</p>
          <button type="button" class="mt-2 text-[12px] font-bold text-primary" @click="emit('retry-cards')">
            다시 시도
          </button>
        </div>
        <div v-else-if="cards.length === 0" class="rounded-xl bg-slate-50 px-4 py-5 text-center">
          <CreditCard class="mx-auto text-slate-300" :size="28" />
          <p class="mt-2 text-[12px] font-semibold text-slate-500">등록된 카드가 없습니다.</p>
        </div>
        <div v-else class="space-y-2">
          <button
            v-for="card in cards"
            :key="card.cardId"
            type="button"
            class="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors"
            :class="selectedPaymentSourceType === 'CARD' && card.cardId === selectedCardId ? 'border-primary bg-blue-50' : 'border-slate-200 bg-white'"
            @click="emit('select-card', card.cardId)"
          >
            <span class="grid size-10 shrink-0 place-items-center rounded-full bg-blue-100 text-primary">
              <CreditCard :size="21" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex items-center gap-2">
                <strong class="truncate text-[14px] text-slate-800">{{ card.cardName }}</strong>
                <span v-if="card.isPrimary" class="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">주 카드</span>
              </span>
              <span class="mt-1 block text-[12px] text-slate-500">
                {{ card.cardCompanyName }} · {{ formatCardNumber(card.maskedNumber) }}
              </span>
            </span>
            <Check
              v-if="selectedPaymentSourceType === 'CARD' && card.cardId === selectedCardId"
              class="shrink-0 text-primary"
              :size="20"
              :stroke-width="3"
            />
          </button>
        </div>
      </section>
    </DialogContent>
  </Dialog>
</template>
