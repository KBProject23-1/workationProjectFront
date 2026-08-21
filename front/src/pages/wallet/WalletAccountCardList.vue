<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAccountStore } from '@/stores/accountStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { Plus, Landmark } from '@lucide/vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import BaseEmptyState from '@/components/common/BaseEmptyState.vue';
import AccountListItem from '@/components/account/AccountListItem.vue';

const router = useRouter();
const accountStore = useAccountStore();
const { showError } = useErrorToast();

const confirmState = ref({ visible: false, type: null, accountId: null });
const isProcessing = ref(false);

function requestSetPrimary(accountId) {
  confirmState.value = { visible: true, type: 'primary', accountId };
}

function requestDelete(accountId) {
  confirmState.value = { visible: true, type: 'delete', accountId };
}

function closeConfirm() {
  confirmState.value = { ...confirmState.value, visible: false };
}

function goToWallet() {
  router.push('/wallet');
}

async function handleConfirm() {
  const { type, accountId } = confirmState.value;
  isProcessing.value = true;
  try {
    if (type === 'primary') {
      await accountStore.setPrimaryAccount(accountId);
    } else if (type === 'delete') {
      await accountStore.deleteAccount(accountId);
    }
  } catch (err) {
    showError(
      err,
      type === 'primary'
        ? '주 계좌 변경에 실패했어요.'
        : '계좌 삭제에 실패했어요.',
    );
  } finally {
    isProcessing.value = false;
    closeConfirm();
  }
}

onMounted(() => {
  accountStore.fetchMyAccounts();
});
</script>

<template>
  <main class="flex flex-col w-full min-h-screen px-5 pt-4 pb-5 bg-canvas text-left">
    <div class="mb-6">
      <BaseHeader title="연결 계좌" @back="goToWallet" />
    </div>

    <div class="flex items-center justify-between mb-3">
      <p class="text-body-sm font-semibold text-ink-sub">
        연동된 계좌
        <span class="text-brand font-bold ml-0.5">{{
          accountStore.accounts.length
        }}</span>
      </p>
    </div>

    <div class="flex flex-col gap-3 w-full flex-1">
      <AccountListItem
        v-for="account in accountStore.accounts"
        :key="account.accountId"
        :account="account"
        @set-primary="requestSetPrimary"
        @delete="requestDelete"
      />

      <BaseEmptyState
        v-if="accountStore.accounts.length === 0"
        :icon="Landmark"
        title="연동된 계좌가 없습니다."
        description="새 계좌를 연동해 이용해보세요."
      />
    </div>

    <div class="w-full pt-4 pb-2 mt-auto">
      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 border-2 border-dashed border-line bg-canvas/50 hover:bg-canvas hover:border-line rounded-sheet py-3.5 text-body font-bold text-ink-sub transition-all active:scale-[0.99]"
        @click="router.push('/account/link')"
      >
        <Plus :size="18" class="text-ink-sub" />
        새 계좌 추가 연동하기
      </button>
    </div>

    <BaseConfirmModal
      :visible="confirmState.visible"
      :title="confirmState.type === 'primary' ? '주 계좌 변경' : '계좌 삭제'"
      :message="
        confirmState.type === 'primary'
          ? '이 계좌를 주 계좌로 변경할까요?'
          : '이 계좌를 연결 해제할까요?'
      "
      :loading="isProcessing"
      @confirm="handleConfirm"
      @cancel="closeConfirm"
    />
  </main>
</template>
