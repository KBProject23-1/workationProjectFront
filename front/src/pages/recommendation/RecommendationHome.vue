<template>
  <div class="min-h-screen bg-white px-5 pt-4 pb-8">
    <header class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-bold text-slate-900">추천</h1>
    </header>

    <p v-if="loading" class="py-20 text-center text-sm text-slate-400">
      불러오는 중...
    </p>

    <div v-else class="py-20 text-center">
      <p class="text-sm text-slate-400">추천 화면은 준비 중이에요</p>
      <button class="mt-4 text-sm font-bold text-blue-600" @click="goStyle">
        나의 워케이션 스타일 보기
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSurveyStore } from '@/stores/surveyStore';

// 추천 화면 본체는 추천 담당자가 만든다.
// 여기서는 설문 응답 여부만 확인해 최초 1회 설문으로 보낸다.
const router = useRouter();
const surveyStore = useSurveyStore();

const loading = ref(true);

onMounted(async () => {
  try {
    const result = await surveyStore.fetchMySurvey();
    if (!result) {
      router.replace('/survey/intro');
      return;
    }
  } finally {
    loading.value = false;
  }
});

const goStyle = () => {
  router.push('/survey/result');
};
</script>
