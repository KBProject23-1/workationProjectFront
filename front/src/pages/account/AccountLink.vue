<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAccountStore } from '@/stores/accountStore';
import AccountLinkIntro from '@/components/account/AccountLinkIntro.vue';
import AccountLinkSelect from '@/components/account/AccountLinkSelect.vue';
import AccountLinkComplete from '@/components/account/AccountLinkComplete.vue';

const router = useRouter();
const accountStore = useAccountStore();

const step = ref(1);
const linkedAccounts = ref([]);
const errorMessage = ref('');

async function handleLink(selectedIds) {
  try {
    const data = await accountStore.linkAccounts(selectedIds);
    linkedAccounts.value = data;
    step.value = 3;
  } catch (err) {
    errorMessage.value =
      err.message || '계좌 연동에 실패했어요. 다시 시도해주세요.';
    setTimeout(() => {
      errorMessage.value = '';
    }, 3000);
  }
}

function handleConfirm() {
  router.push('/wallet');
}

onMounted(() => {
  accountStore.fetchAvailableAccounts();
});
</script>

<template>
  <div class="w-full mx-auto flex flex-col min-h-screen">
    <div
      v-if="errorMessage"
      class="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[14px] px-4 py-2 rounded-lg z-50"
    >
      {{ errorMessage }}
    </div>

    <AccountLinkIntro v-if="step === 1" @start="step = 2" />
    <AccountLinkSelect
      v-else-if="step === 2"
      :accounts="accountStore.availableAccounts"
      :is-loading="accountStore.isLoading"
      @complete="handleLink"
      @back="step = 1"
    />
    <AccountLinkComplete
      v-else-if="step === 3"
      :linked-accounts="linkedAccounts"
      @confirm="handleConfirm"
    />
  </div>
</template>
