<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronLeft, Landmark } from '@lucide/vue';
import AccountSelectCard from '@/components/account/AccountSelectCard.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps({
  accounts: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  isAdditional: { type: Boolean, default: false },
});

const emit = defineEmits(['complete', 'back-to-intro']);

const router = useRouter();
const selectedIds = ref([]);

function toggleSelect(id) {
  const index = selectedIds.value.indexOf(id);
  if (index === -1) {
    selectedIds.value.push(id);
  } else {
    selectedIds.value.splice(index, 1);
  }
}

function handleBack() {
  if (props.isAdditional) {
    router.push('/wallet');
  } else {
    emit('back-to-intro');
  }
}
</script>

<template>
  <div class="flex flex-col w-full min-h-screen px-5 py-5 bg-white text-left">
    <div class="flex items-center gap-2 mb-6">
      <button
        type="button"
        class="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full active:bg-gray-100 transition-colors"
        @click="handleBack"
      >
        <ChevronLeft :size="24" />
      </button>
      <h1 class="text-[18px] font-bold text-gray-900">계좌 선택</h1>
    </div>

    <div class="mb-5 flex items-end justify-between">
      <div>
        <h2 class="text-[20px] font-bold text-gray-900 leading-snug">
          연동할 계좌를<br />선택해 주세요
        </h2>
        <p class="text-[13px] font-medium text-gray-400 mt-1">
          여러 개의 계좌를 한 번에 선택할 수 있어요
        </p>
      </div>

      <span
        v-if="selectedIds.length > 0"
        class="text-[12px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg shrink-0"
      >
        {{ selectedIds.length }}개 선택됨
      </span>
    </div>

    <div class="flex flex-col gap-3 flex-1 w-full">
      <AccountSelectCard
        v-for="account in accounts"
        :key="account.linkableAccountId"
        :account="account"
        :is-selected="selectedIds.includes(account.linkableAccountId)"
        @select="toggleSelect"
      />

      <div
        v-if="accounts.length === 0 && !isLoading"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <div
          class="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3 text-gray-300"
        >
          <Landmark :size="24" />
        </div>
        <p class="text-[14px] font-medium text-gray-400">
          연동 가능한 계좌가 없어요
        </p>
      </div>
    </div>

    <div class="w-full pt-4 pb-2 mt-auto text-center">
      <BaseButton
        :disabled="selectedIds.length === 0 || isLoading"
        class="w-full py-3.5 text-[15px] font-bold rounded-2xl shadow-xs"
        @click="$emit('complete', selectedIds)"
      >
        {{
          isLoading
            ? '연동하는 중...'
            : `${selectedIds.length > 0 ? selectedIds.length + '개 ' : ''}계좌 연동하기`
        }}
      </BaseButton>
    </div>
  </div>
</template>
