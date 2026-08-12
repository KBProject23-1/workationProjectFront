<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAccountStore } from '@/stores/accountStore';
import { useErrorToast } from '@/composables/useErrorToast';
import AccountLinkIntro from '@/components/account/AccountLinkIntro.vue';
import AccountLinkSelect from '@/components/account/AccountLinkSelect.vue';
import AccountLinkComplete from '@/components/account/AccountLinkComplete.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';

const router = useRouter();
const accountStore = useAccountStore();
const { showError } = useErrorToast();

// 0: 목록 불러오는 중, 1: 인트로, 2: 계좌 선택, 3: 연동 진행 중, 4: 완료
const step = ref(0);
const linkedAccounts = ref([]);
const isAdditional = ref(false); // 이미 연동된 계좌가 있으면 추가 등록

const LIST_LOADING_DURATION = 900; // 목록 로딩 최소 노출 시간(ms)
const LINKING_DURATION = 900; // 연동 처리 최소 노출 시간(ms)

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function handleLink(selectedIds) {
  step.value = 3; // 연동 처리 로딩 시작
  try {
    // mock API 가 즉시 응답해도 최소 노출 시간을 보장해 "처리되는 느낌"을 유지
    const [data] = await Promise.all([
      accountStore.linkAccounts(selectedIds),
      delay(LINKING_DURATION),
    ]);
    linkedAccounts.value = data;
    step.value = 4;
  } catch (err) {
    step.value = 2; // 실패 시 선택 화면으로 복귀
    showError(err, '계좌 연동에 실패했어요. 다시 시도해주세요.');
  }
}

function handleConfirm() {
  router.push('/wallet');
}

onMounted(async () => {
  // 목록 조회도 즉시 끝나면 밋밋하므로 최소 노출 시간을 함께 보장
  await Promise.all([
    (async () => {
      await accountStore.fetchMyAccounts();
      isAdditional.value = accountStore.accounts.length > 0;
      await accountStore.fetchAvailableAccounts();
    })(),
    delay(LIST_LOADING_DURATION),
  ]);
  // 인트로는 최초 연동(첫 회원가입 후)에만 노출, 추가 연동이면 바로 계좌 선택
  step.value = isAdditional.value ? 2 : 1;
});
</script>

<template>
  <main class="w-full mx-auto flex flex-col min-h-screen">
    <LoadingScreen
      v-if="step === 0"
      title="계좌 정보를 불러오고 있어요"
      description="연동 가능한 계좌를 확인하고 있어요"
    />

    <AccountLinkIntro
      v-else-if="step === 1"
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
    <LoadingScreen
      v-else-if="step === 3"
      title="계좌를 안전하게 연결하고 있어요"
      description="잠시만 기다려 주세요"
    />
    <AccountLinkComplete
      v-else-if="step === 4"
      :linked-accounts="linkedAccounts"
      @confirm="handleConfirm"
    />
  </main>
</template>
