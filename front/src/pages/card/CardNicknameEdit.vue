<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCardStore } from '@/stores/cardStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { ChevronLeft } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import CardNicknameForm from '@/components/card/CardNicknameForm.vue';

const router = useRouter();
const route = useRoute();
const cardStore = useCardStore();
const { showError } = useErrorToast();

const cardId = Number(route.params.cardId);
const nickname = ref('');
const isSaving = ref(false);

const card = computed(() => cardStore.cards.find((c) => c.cardId === cardId));

function handleUpdate(value) {
  nickname.value = value;
}

async function handleSave() {
  if (!nickname.value.trim()) {
    showError(null, '별칭을 입력해주세요.');
    return;
  }
  isSaving.value = true;
  try {
    await cardStore.updateCardNickname(cardId, nickname.value.trim());
    router.back();
  } catch (err) {
    showError(err, '별칭 변경에 실패했어요.');
  } finally {
    isSaving.value = false;
  }
}

onMounted(() => {
  if (!card.value) {
    cardStore.fetchMyCards();
  }
});
</script>

<template>
  <main
    class="flex flex-col items-center w-full min-h-screen px-5 py-5 bg-white"
  >
    <div class="w-full flex items-center gap-2 mb-6">
      <button
        type="button"
        class="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full active:bg-gray-100 transition-colors"
        aria-label="뒤로 가기"
        @click="router.back()"
      >
        <ChevronLeft :size="24" />
      </button>
      <h1 class="text-[18px] font-bold text-gray-900">카드 별칭 설정</h1>
    </div>

    <CardNicknameForm v-if="card" :card="card" @update="handleUpdate" />

    <div class="flex-1"></div>

    <div class="w-full pb-4 text-center">
      <BaseButton
        :disabled="isSaving"
        class="w-full py-3.5 text-[15px] font-bold rounded-2xl"
        @click="handleSave"
      >
        {{ isSaving ? '변경 중...' : '변경' }}
      </BaseButton>
    </div>
  </main>
</template>
