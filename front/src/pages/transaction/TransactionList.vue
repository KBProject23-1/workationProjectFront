<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCardStore } from '@/stores/cardStore';
import { SlidersHorizontal } from '@lucide/vue';
import TransactionListItem from '@/components/transaction/TransactionListItem.vue';
import TransactionSummary from '@/components/transaction/TransactionSummary.vue';
import TransactionFilterModal from '@/components/transaction/TransactionFilterModal.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import BaseEmptyState from '@/components/common/BaseEmptyState.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';

const router = useRouter();
const transactionStore = useTransactionStore();
const cardStore = useCardStore();

const isFilterOpen = ref(false);
const sentinel = ref(null);
let observer = null;

function goToWallet() {
  router.push('/wallet');
}

function goToDetail(transactionId) {
  router.push(`/transaction/${transactionId}`);
}

function handleApplyFilter(filters) {
  isFilterOpen.value = false;
  transactionStore.fetchTransactions(filters);
}

// 현재 필터를 유지한 채 재조회
function retryFetch() {
  transactionStore.fetchTransactions();
}

onBeforeRouteLeave((to) => {
  transactionStore.setReturnedFromDetail(to.name === 'TransactionDetail');
});

onMounted(() => {
  cardStore.fetchAllCardsForFilter();

  if (transactionStore.returnedFromDetail) {
    transactionStore.setReturnedFromDetail(false);
  } else {
    transactionStore.resetFilters();
    transactionStore.fetchTransactions();
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        transactionStore.fetchMoreTransactions();
      }
    },
    { threshold: 0.1 },
  );
  if (sentinel.value) observer.observe(sentinel.value);
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <main class="flex flex-col items-center w-full min-h-screen bg-white">
    <div class="sticky top-0 z-10 w-full bg-white px-5 pt-4 pb-3">
      <div class="w-full mb-4">
        <BaseHeader
          title="거래내역"
          @back="goToWallet"
        >
          <template #right>
            <button type="button" aria-label="필터" @click="isFilterOpen = true">
              <SlidersHorizontal :size="20" class="text-gray-500" />
            </button>
          </template>
        </BaseHeader>
      </div>

      <TransactionSummary
        :charge="transactionStore.totalCharge"
        :outflow="transactionStore.totalOutflow"
        :outflow-count="transactionStore.outflowCount"
      />
    </div>

    <div class="flex flex-col w-full flex-1 px-5">
      <!-- 초기 로딩 스켈레톤 -->
      <div
        v-if="
          transactionStore.isLoading &&
          transactionStore.transactions.length === 0
        "
        class="space-y-3 pt-2"
        aria-label="거래내역을 불러오는 중"
      >
        <div
          v-for="i in 5"
          :key="i"
          class="h-[72px] animate-pulse rounded-xl bg-gray-100"
        ></div>
      </div>

      <!-- 에러 -->
      <div
        v-else-if="
          transactionStore.error && transactionStore.transactions.length === 0
        "
        class="flex flex-1 flex-col items-center justify-center py-20 text-center"
      >
        <BaseErrorState
          title="거래내역을 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요"
          @retry="retryFetch"
        />
      </div>

      <!-- 목록 -->
      <template v-else>
        <TransactionListItem
          v-for="transaction in transactionStore.transactions"
          :key="transaction.transactionId"
          :transaction="transaction"
          @select="goToDetail"
        />
        <BaseEmptyState
          v-if="transactionStore.transactions.length === 0"
          title="이번 달 거래내역이 없어요"
        />
      </template>

      <!-- sentinel 은 항상 렌더해 옵저버 부착이 깨지지 않도록 유지 -->
      <div ref="sentinel" class="h-4"></div>
      <p
        v-if="transactionStore.isLoadingMore"
        class="text-[13px] text-gray-500 text-center py-4"
      >
        불러오는 중...
      </p>
    </div>

    <TransactionFilterModal
      :visible="isFilterOpen"
      :model-value="transactionStore.filters"
      :cards="cardStore.allCardsForFilter"
      @apply="handleApplyFilter"
      @close="isFilterOpen = false"
    />
  </main>
</template>
