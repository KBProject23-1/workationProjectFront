<template>
  <div class="flex min-h-screen flex-col bg-white px-5 pt-4 pb-8">
    <header class="relative mb-4 flex items-center justify-center">
      <button class="absolute left-0 text-xl text-slate-900" @click="goBack">
        ‹
      </button>
      <h1 class="text-base font-bold text-slate-900">나의 워케이션 스타일</h1>
      <span class="absolute right-0 text-xs text-slate-400">
        {{ page }} / {{ totalPages }}
      </span>
    </header>

    <div class="h-1 w-full rounded-full bg-blue-100">
      <div
        class="h-1 rounded-full bg-blue-600 transition-all"
        :style="{ width: progress + '%' }"
      />
    </div>

    <p v-if="loading" class="py-20 text-center text-sm text-slate-400">
      불러오는 중...
    </p>

    <p v-else-if="errorMessage" class="py-20 text-center text-sm text-red-500">
      {{ errorMessage }}
    </p>

    <p
      v-else-if="pageQuestions.length === 0"
      class="py-20 text-center text-sm text-slate-400"
    >
      등록된 설문 문항이 없어요
    </p>

    <div v-else class="mt-6 flex-1 space-y-8">
      <SurveyQuestionBlock
        v-for="(question, index) in pageQuestions"
        :key="question.questionId"
        :question="question"
        :order="startOrder + index"
        :selected="answers[question.questionId] ?? []"
        @change="setAnswer"
      />
    </div>

    <Button
      class="mt-8 h-12 w-full rounded-xl text-base"
      :disabled="!canGoNext || submitting"
      @click="next"
    >
      {{ submitLabel }}
    </Button>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { Button } from '@/components/ui/button';
import { useSurveyStore } from '@/stores/surveyStore';
import { useErrorToast } from '@/composables/useErrorToast';
import SurveyQuestionBlock from '@/components/survey/SurveyQuestionBlock.vue';

const route = useRoute();
const router = useRouter();
const surveyStore = useSurveyStore();
const { showError } = useErrorToast();
const { error: errorMessage } = storeToRefs(surveyStore);

const loading = ref(true);
const submitting = ref(false);
const page = ref(1);

// { questionId: [optionId, ...] }
const answers = reactive({});

// 이미 응답이 있으면 수정 모드로 동작한다
const isEdit = computed(() => route.query.mode === 'edit');

onMounted(async () => {
  try {
    await surveyStore.fetchQuestions();
    if (isEdit.value) {
      await surveyStore.fetchMySurvey();
      Object.entries(surveyStore.selectedMap).forEach(([questionId, ids]) => {
        answers[questionId] = ids;
      });
    }
  } catch (error) {
    showError(error, '설문을 불러오지 못했습니다.');
  } finally {
    loading.value = false;
  }
});

const totalPages = computed(() => surveyStore.totalPages);
const pageQuestions = computed(() => surveyStore.questionsOfPage(page.value));
const startOrder = computed(() => (page.value - 1) * 2 + 1);
const progress = computed(() => (page.value / totalPages.value) * 100);
const isLastPage = computed(() => page.value >= totalPages.value);

const submitLabel = computed(() => {
  if (submitting.value) return '저장 중...';
  return isLastPage.value ? '완료' : '다음';
});

const setAnswer = (questionId, optionIds) => {
  answers[questionId] = optionIds;
};

// 현재 페이지의 필수 문항을 최소 개수만큼 채웠는지 본다
const canGoNext = computed(() =>
  pageQuestions.value.every((question) => {
    const picked = answers[question.questionId] ?? [];
    const min = question.required ? (question.minSelections ?? 1) : 0;
    return picked.length >= min;
  }),
);

const buildPayload = () =>
  Object.entries(answers)
    .filter(([, optionIds]) => optionIds.length > 0)
    .map(([questionId, optionIds]) => ({
      questionId: Number(questionId),
      optionIds,
    }));

const submit = async () => {
  submitting.value = true;
  try {
    if (isEdit.value && surveyStore.surveyId) {
      await surveyStore.updateSurvey(surveyStore.surveyId, buildPayload());
    } else {
      await surveyStore.createSurvey(buildPayload());
    }
    router.replace('/survey/result');
  } catch (error) {
    // 이미 저장된 설문이 있으면 수정으로 넘긴다
    if (error.response?.data?.errorCode === 'SURVEY_ALREADY_EXISTS') {
      showError(error, '이미 등록된 설문이 있습니다.');
      router.replace('/survey/result');
      return;
    }
    showError(error, '설문을 저장하지 못했습니다.');
  } finally {
    submitting.value = false;
  }
};

const next = () => {
  if (!isLastPage.value) {
    page.value += 1;
    window.scrollTo({ top: 0 });
    return;
  }
  submit();
};

const goBack = () => {
  if (page.value > 1) {
    page.value -= 1;
    window.scrollTo({ top: 0 });
    return;
  }
  router.back();
};
</script>
