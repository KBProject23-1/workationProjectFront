<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAccountStore } from '@/stores/accountStore';
import { useErrorToast } from '@/composables/useErrorToast';
import BaseToast from '@/components/common/BaseToast.vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';
import AccountListItem from '@/components/account/AccountListItem.vue';

const router = useRouter();
const accountStore = useAccountStore();
const { errorMessage, showError } = useErrorToast();

const confirmState = ref({ visible: false, accountId: null });

function requestSetPrimary(accountId) {
  confirmState.value = { visible: true, accountId };
}

function closeConfirm() {
  confirmState.value = { visible: false, accountId: null };
}

function goToWallet() {
  router.push('/wallet');
}

async function handleConfirm() {
  try {
    await accountStore.setPrimaryAccount(confirmState.value.accountId);
  } catch (err) {
    showError(err, '주 계좌 변경에 실패했어요.');
  } finally {
    closeConfirm();
  }
}

async function handleDeleteAccount(id) {
  try {
    await accountStore.deleteAccount(id);
  } catch (err) {
    showError(err, '계좌 삭제에 실패했어요.');
  }
}

onMounted(() => {
  accountStore.fetchMyAccounts();
});
</script>

<template>
  <div
    class="flex flex-col items-center w-full min-h-screen px-5 py-6 bg-white"
  >
    <BaseToast :message="errorMessage" />

    <div class="w-full flex items-center mb-6">
      <button type="button" class="text-2xl" @click="goToWallet">‹</button>
      <h1 class="text-xl font-bold ml-2">연결 계좌</h1>
    </div>

    <p class="w-full text-left text-[14px] text-gray-500 mb-3">
      연동된 계좌 ({{ accountStore.accounts.length }})
    </p>

    <div class="flex flex-col gap-3 w-full flex-1">
      <AccountListItem
        v-for="account in accountStore.accounts"
        :key="account.accountId"
        :account="account"
        @set-primary="requestSetPrimary"
        @delete="handleDeleteAccount"
      />
      <p
        v-if="accountStore.accounts.length === 0"
        class="text-[14px] text-gray-400 text-center mt-8"
      >
        연동된 계좌가 없어요
      </p>
    </div>

    <div class="w-full pb-4 mt-6">
      <button
        type="button"
        class="w-full border rounded-xl py-3 text-[14px] text-gray-600"
        @click="router.push('/account/link')"
      >
        추가 연동하기
      </button>
    </div>

    <BaseConfirmModal
      :visible="confirmState.visible"
      title="주 계좌 변경"
      message="이 계좌를 주 계좌로 변경할까요?"
      @confirm="handleConfirm"
      @cancel="closeConfirm"
    />
  </div>
</template>
