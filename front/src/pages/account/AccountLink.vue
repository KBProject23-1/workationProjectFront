<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAccountStore } from '@/stores/accountStore';
import { useErrorToast } from '@/composables/useErrorToast';
import AccountLinkIntro from '@/components/account/AccountLinkIntro.vue';
import AccountLinkSelect from '@/components/account/AccountLinkSelect.vue';
import AccountLinkComplete from '@/components/account/AccountLinkComplete.vue';

const router = useRouter();
const accountStore = useAccountStore();
const { showError } = useErrorToast();

const step = ref(0); // 0: 초기 상태 확인 중
const linkedAccounts = ref([]);
const isAdditional = ref(false); // 이미 연동된 계좌가 있으면 추가 등록

async function handleLink(selectedIds) {
  try {
    const data = await accountStore.linkAccounts(selectedIds);
    linkedAccounts.value = data;
    step.value = 3;
  } catch (err) {
    showError(err, '계좌 연동에 실패했어요. 다시 시도해주세요.');
  }
}

function handleConfirm() {
  router.push('/wallet');
}

onMounted(async () => {
  await accountStore.fetchMyAccounts();
  isAdditional.value = accountStore.accounts.length > 0;
  await accountStore.fetchAvailableAccounts();
  step.value = 1;
});
</script>

<template>
  <div class="w-full mx-auto flex flex-col min-h-screen">
    <p v-if="step === 0" class="text-[14px] text-gray-400 text-center mt-10">
      불러오는 중...
    </p>

    <AccountLinkIntro
      v-if="step === 1"
      :is-additional="isAdditional"
      @start="step = 2"
    />
    <AccountLinkSelect
      v-else-if="step === 2"
      :accounts="accountStore.availableAccounts"
      :is-loading="accountStore.isLoading"
      :is-additional="isAdditional"
      @complete="handleLink"
      @back-to-intro="step = 1"
    />
    <AccountLinkComplete
      v-else-if="step === 3"
      :linked-accounts="linkedAccounts"
      @confirm="handleConfirm"
    />
  </div>
</template>
