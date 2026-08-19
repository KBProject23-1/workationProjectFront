<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCardStore } from '@/stores/cardStore';
import { useErrorToast } from '@/composables/useErrorToast';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
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
    <div class="w-full mb-6">
      <BaseHeader title="카드 별칭 설정" @back="router.back()" />
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
