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
  <div
    class="flex flex-col items-center w-full min-h-screen px-5 py-6 bg-white"
  >
    <div class="w-full flex items-center mb-6">
      <button type="button" @click="router.back()">
        <ChevronLeft :size="24" />
      </button>
      <h1 class="text-xl font-bold ml-2">카드 별칭 설정</h1>
    </div>

    <CardNicknameForm v-if="card" :card="card" @update="handleUpdate" />

    <div class="flex-1"></div>

    <div class="w-full pb-4">
      <BaseButton :disabled="isSaving" class="w-full" @click="handleSave">
        {{ isSaving ? '저장 중...' : '저장' }}
      </BaseButton>
    </div>
  </div>
</template>
