<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { useTransactionStore } from '@/stores/transactionStore';
import { ChevronLeft, SlidersHorizontal } from '@lucide/vue';
import TransactionListItem from '@/components/transaction/TransactionListItem.vue';
import TransactionSummary from '@/components/transaction/TransactionSummary.vue';
import TransactionFilterModal from '@/components/transaction/TransactionFilterModal.vue';

const router = useRouter();
const transactionStore = useTransactionStore();

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

onBeforeRouteLeave((to) => {
  transactionStore.setReturnedFromDetail(to.name === 'TransactionDetail');
});

onMounted(() => {
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
  <div class="flex flex-col items-center w-full min-h-screen bg-white">
    <div class="sticky top-0 z-10 w-full bg-white px-5 pt-6 pb-3">
      <div class="w-full flex items-center justify-between mb-4">
        <div class="flex items-center">
          <button type="button" @click="goToWallet">
            <ChevronLeft :size="24" />
          </button>
          <h1 class="text-xl font-bold ml-2">거래내역</h1>
        </div>
        <button type="button" @click="isFilterOpen = true">
          <SlidersHorizontal :size="20" class="text-gray-500" />
        </button>
      </div>

      <TransactionSummary
        :charge="transactionStore.totalCharge"
        :outflow="transactionStore.totalOutflow"
        :outflow-count="transactionStore.outflowCount"
      />
    </div>

    <div class="flex flex-col w-full flex-1 px-5">
      <TransactionListItem
        v-for="transaction in transactionStore.transactions"
        :key="transaction.transactionId"
        :transaction="transaction"
        @select="goToDetail"
      />
      <p
        v-if="
          transactionStore.transactions.length === 0 &&
          !transactionStore.isLoading
        "
        class="text-[14px] text-gray-400 text-center mt-8"
      >
        거래내역이 없어요
      </p>

      <div ref="sentinel" class="h-4"></div>
      <p
        v-if="transactionStore.isLoadingMore"
        class="text-[13px] text-gray-400 text-center py-4"
      >
        불러오는 중...
      </p>
    </div>

    <TransactionFilterModal
      :visible="isFilterOpen"
      :model-value="transactionStore.filters"
      @apply="handleApplyFilter"
      @close="isFilterOpen = false"
    />
  </div>
</template>
