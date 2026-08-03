<script setup>
import { ref } from 'vue';
import AccountSelectCard from '@/components/account/AccountSelectCard.vue';
import BaseButton from '@/components/common/BaseButton.vue';

defineProps({
  accounts: { type: Array, default: () => [] },
});

defineEmits(['complete']);

const selectedIds = ref([]);

function toggleSelect(id) {
  const index = selectedIds.value.indexOf(id);
  if (index === -1) {
    selectedIds.value.push(id);
  } else {
    selectedIds.value.splice(index, 1);
  }
}
</script>

<template>
  <div
    class="flex flex-col items-center w-full min-h-screen px-5 py-6 text-center bg-white"
  >
    <button type="button" class="text-2xl mb-4 self-start">‹</button>
    <h1 class="text-xl font-bold mb-6">계좌 선택</h1>
    <p class="text-[14px] text-gray-500 mb-4">연동할 계좌를 선택해주세요</p>

    <div class="flex flex-col gap-3 flex-1 w-full text-left">
      <AccountSelectCard
        v-for="account in accounts"
        :key="account.linkableAccountId"
        :account="account"
        :is-selected="selectedIds.includes(account.linkableAccountId)"
        @select="toggleSelect"
      />
    </div>

    <div class="w-full pb-4">
      <BaseButton
        :disabled="selectedIds.length === 0"
        class="w-full mt-6"
        @click="$emit('complete', selectedIds)"
      >
        선택 완료
      </BaseButton>
    </div>
  </div>
</template>
