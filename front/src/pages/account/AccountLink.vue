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

async function handleLink(selectedIds) {
  const data = await accountStore.linkAccounts(selectedIds);
  linkedAccounts.value = data;
  step.value = 3;
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
    <AccountLinkIntro v-if="step === 1" @start="step = 2" />
    <AccountLinkSelect
      v-else-if="step === 2"
      :accounts="accountStore.availableAccounts"
      @complete="handleLink"
    />
    <AccountLinkComplete
      v-else-if="step === 3"
      :linked-accounts="linkedAccounts"
      @confirm="handleConfirm"
    />
  </div>
</template>
