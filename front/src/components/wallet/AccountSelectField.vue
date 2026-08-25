<script setup>
import { ref, computed } from 'vue';
import { Landmark, Check, ChevronDown } from '@lucide/vue';

// 충전(출금)·환불(입금) 화면에서 계좌를 고르는 공용 필드.
// 기본값은 부모가 주 계좌로 넣어주고, 계좌가 여러 개면 펼쳐서 바꿀 수 있다.
const props = defineProps({
  accounts: { type: Array, default: () => [] },
  modelValue: { type: [Number, String], default: null },
  label: { type: String, default: '계좌' },
  emptyText: { type: String, default: '연동된 계좌가 없습니다.' },
  // 계좌 조회 중에는 빈 상태 대신 스켈레톤을 보여줘 "계좌 없음" 깜빡임을 막는다
  isLoading: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);

const selectedAccount = computed(
  () =>
    props.accounts.find((a) => a.accountId === props.modelValue) ??
    props.accounts[0] ??
    null,
);

// 계좌가 2개 이상일 때만 선택(펼치기) 가능
const isSelectable = computed(() => props.accounts.length > 1);

function toggleOpen() {
  if (!isSelectable.value) return;
  isOpen.value = !isOpen.value;
}

function select(accountId) {
  emit('update:modelValue', accountId);
  isOpen.value = false;
}
</script>

<template>
  <div>
    <p class="text-body-sm font-semibold text-ink-sub mb-2">{{ label }}</p>

    <div v-if="selectedAccount" class="relative">
      <button
        type="button"
        class="flex w-full items-center justify-between rounded-sheet border border-line bg-canvas/50 p-4 text-left transition-all"
        :class="isSelectable ? 'hover:bg-canvas cursor-pointer' : 'cursor-default'"
        @click="toggleOpen"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-10 h-10 rounded-card bg-white flex items-center justify-center shrink-0 shadow-xs border border-line"
          >
            <Landmark :size="18" class="text-brand" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <p class="text-body font-bold text-ink truncate">
                {{ selectedAccount.bankName }}
              </p>
              <span
                v-if="selectedAccount.isPrimary"
                class="text-caption font-bold text-brand bg-brand-weak/70 px-1.5 py-0.5 rounded-chip shrink-0"
              >
                주 계좌
              </span>
            </div>
            <p class="text-body-sm font-medium text-ink-sub mt-0.5 truncate">
              {{ selectedAccount.maskedAccountNumber }}
            </p>
          </div>
        </div>

        <ChevronDown
          v-if="isSelectable"
          :size="18"
          class="shrink-0 text-ink-sub transition-transform"
          :class="{ 'rotate-180': isOpen }"
        />
      </button>

      <!-- 바깥 클릭 시 닫기용 백드롭 -->
      <div v-if="isOpen" class="fixed inset-0 z-10" @click="isOpen = false" />

      <!-- 펼침 목록: 다른 계좌 선택 -->
      <div
        v-if="isOpen"
        class="absolute z-20 mt-1.5 w-full rounded-sheet border border-line bg-white p-1.5 shadow-xl"
      >
        <button
          v-for="account in accounts"
          :key="account.accountId"
          type="button"
          class="flex w-full items-center justify-between gap-2 rounded-card px-3 py-2.5 text-left transition-colors hover:bg-canvas"
          @click="select(account.accountId)"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div
              class="w-8 h-8 rounded-chip bg-canvas flex items-center justify-center shrink-0 border border-line"
            >
              <Landmark :size="15" class="text-brand" />
            </div>
            <div class="min-w-0">
              <p class="text-body-sm font-bold text-ink truncate">
                {{ account.bankName }}
                <span
                  v-if="account.isPrimary"
                  class="text-caption font-bold text-brand ml-1"
                  >· 주 계좌</span
                >
              </p>
              <p class="text-caption font-medium text-ink-sub truncate">
                {{ account.maskedAccountNumber }}
              </p>
            </div>
          </div>
          <Check
            v-if="account.accountId === selectedAccount.accountId"
            :size="16"
            class="shrink-0 text-brand"
          />
        </button>
      </div>
    </div>

    <!-- 조회 중: 스켈레톤 -->
    <div
      v-else-if="isLoading"
      class="flex items-center gap-3 rounded-sheet border border-line bg-canvas/50 p-4"
    >
      <div class="w-10 h-10 rounded-card bg-canvas animate-pulse shrink-0"></div>
      <div class="flex-1 space-y-1.5">
        <div class="h-3.5 w-24 rounded bg-canvas animate-pulse"></div>
        <div class="h-3 w-32 rounded bg-canvas animate-pulse"></div>
      </div>
    </div>

    <div
      v-else
      class="rounded-sheet border border-dashed border-line p-4 text-center bg-surface shadow-card"
    >
      <p class="text-body-sm font-medium text-ink-sub">{{ emptyText }}</p>
    </div>
  </div>
</template>
