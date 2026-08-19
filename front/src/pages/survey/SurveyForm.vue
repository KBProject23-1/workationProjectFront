<template>
  <div class="flex min-h-screen flex-col bg-white px-5 pt-4 pb-8">
    <div class="mb-4">
      <BaseHeader
        title="나의 워케이션 스타일"
        @back="goBack"
      />
    </div>

    <!--
      첫 등록에서만 단계를 센다.
      두 번째부터는 등록이 일정·예산 2단계이고 설문은 그 사이에 잠깐 들르는 것이라
      여기서 단계를 표시하면 전체 개수가 어긋난다.
    -->
    <template v-if="isFirstCreateFlow">
      <div class="h-1 w-full rounded-full bg-blue-100">
        <div class="h-1 w-2/3 rounded-full bg-blue-600" />
      </div>
      <p class="mt-1 text-right text-xs text-slate-400">2 / 3</p>
    </template>

    <p class="mt-4 text-sm text-slate-500">
      답변을 바탕으로 숙소와 공유오피스를 추천해 드려요
    </p>

    <p v-if="loading" class="py-20 text-center text-sm text-slate-400">
      불러오는 중...
    </p>

    <p v-else-if="errorMessage" class="py-20 text-center text-sm text-red-500">
      {{ errorMessage }}
    </p>

    <p
      v-else-if="questions.length === 0"
      class="py-20 text-center text-sm text-slate-400"
    >
      등록된 설문 문항이 없어요
    </p>

    <!-- 문항 4개를 한 화면에 모두 놓고 스크롤로 내려본다 -->
    <div v-else class="mt-6 flex-1 space-y-10">
      <div
        v-for="(question, index) in questions"
        :key="question.questionId"
        :ref="(el) => setQuestionRef(question.questionId, el)"
      >
        <SurveyQuestionBlock
          :question="question"
          :order="index + 1"
          :selected="answers[question.questionId] ?? []"
          @change="setAnswer"
        />
      </div>
    </div>

    <BaseButton
      v-if="!loading && questions.length > 0"
      variant="default"
      class="mt-8 h-12 w-full rounded-xl text-base"
      :disabled="submitting"
      @click="submit"
    >
      {{ submitLabel }}
    </BaseButton>

    <p
      v-if="unansweredCount > 0 && !loading"
      class="mt-2 text-center text-xs text-slate-400"
    >
      아직 답하지 않은 문항이 {{ unansweredCount }}개 있어요
    </p>

    <BaseConfirmModal
      :visible="cancelOpen"
      title="등록을 취소할까요?"
      message="지금까지 입력한 워케이션 정보가 사라져요."
      :loading="canceling"
      @confirm="cancelRegistration"
      @cancel="cancelOpen = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import BaseButton from '@/components/common/BaseButton.vue';
import { useSurveyStore } from '@/stores/surveyStore';
import { useWorkationStore } from '@/stores/workationStore';
import BaseHeader from '@/components/common/BaseHeader.vue';
import { useErrorToast } from '@/composables/useErrorToast';
import SurveyQuestionBlock from '@/components/survey/SurveyQuestionBlock.vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';

const route = useRoute();
const router = useRouter();
const surveyStore = useSurveyStore();
const workationStore = useWorkationStore();
const { showError } = useErrorToast();
const { questions, error: errorMessage } = storeToRefs(surveyStore);

const workationId = route.params.workationId;

// 이 화면은 세 갈래로 들어온다.
//
//   1) 첫 워케이션 등록 2/3      step=create
//      저장하면 예산(3단계)으로. 뒤로 나가면 반쪽 워케이션이 남아 등록 취소를 묻는다.
//
//   2) 두 번째 워케이션 등록 중 수정  step=create&reuse=1
//      설문 단계를 건너뛰는 흐름에서 잠깐 들른 것이라 저장도 뒤로가기도 예산(2단계)으로.
//      워케이션은 이미 만들어졌고 지울 이유가 없으므로 등록 취소를 묻지 않는다.
//
//   3) 내 정보 > 나의 워케이션 스타일   /account/me/survey/edit
//      저장하면 결과 화면으로, 뒤로가면 왔던 곳으로.
const isCreateFlow = route.query.step === 'create';
const isSurveyReuse = route.query.reuse === '1';

// 등록 도중 이탈을 막아야 하는 경우는 첫 등록뿐이다
const isFirstCreateFlow = isCreateFlow && !isSurveyReuse;

// 설문을 거쳤으면 3단계, 건너뛰는 흐름에서 잠깐 들른 것이면 2단계 그대로다
const budgetLocation = `/workation/${workationId}/budgets?step=create&steps=${isSurveyReuse ? 2 : 3}`;

const loading = ref(true);
const submitting = ref(false);
const cancelOpen = ref(false);
const canceling = ref(false);

// 확인을 마치고 스스로 떠나는 중이면 라우터 가드를 통과시킨다
const leaving = ref(false);

// { questionId: [optionId, ...] }
const answers = reactive({});

// 미응답 문항으로 스크롤하기 위해 DOM 을 들고 있는다
const questionRefs = {};
const setQuestionRef = (questionId, el) => {
  questionRefs[questionId] = el;
};

onMounted(async () => {
  try {
    await surveyStore.fetchQuestions();

    // 뒤로 갔다 다시 들어오는 경우가 있어 기존 응답을 먼저 채운다.
    // 응답이 있으면 저장도 POST 가 아니라 PATCH 로 보내야 한다
    await surveyStore.fetchMySurvey();
    Object.entries(surveyStore.selectedMap).forEach(([questionId, ids]) => {
      answers[questionId] = ids;
    });
  } catch (error) {
    showError(error, '설문을 불러오지 못했습니다.');
  } finally {
    loading.value = false;
  }
});

const setAnswer = (questionId, optionIds) => {
  answers[questionId] = optionIds;
};

const minOf = (question) =>
  question.required ? (question.minSelections ?? 1) : 0;

const isAnswered = (question) =>
  (answers[question.questionId] ?? []).length >= minOf(question);

const unanswered = computed(() =>
  questions.value.filter((question) => !isAnswered(question)),
);

const unansweredCount = computed(() => unanswered.value.length);

const submitLabel = computed(() => {
  if (submitting.value) return '저장 중...';
  return isCreateFlow ? '다음' : '저장';
});

const buildPayload = () =>
  Object.entries(answers)
    .filter(([, optionIds]) => optionIds.length > 0)
    .map(([questionId, optionIds]) => ({
      questionId: Number(questionId),
      optionIds,
    }));

// 답하지 않은 문항이 있으면 저장하지 않고 그 문항으로 데려간다
const scrollToUnanswered = () => {
  const target = questionRefs[unanswered.value[0]?.questionId];
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const submit = async () => {
  if (submitting.value) return;

  if (unansweredCount.value > 0) {
    scrollToUnanswered();
    return;
  }

  submitting.value = true;
  try {
    if (surveyStore.surveyId) {
      await surveyStore.updateSurvey(surveyStore.surveyId, buildPayload());
    } else {
      await surveyStore.createSurvey(buildPayload());
    }

    // 저장을 마쳤으니 이탈 확인을 걸지 않는다
    leaving.value = true;

    // 등록 흐름이면 예산 배분으로, 내 정보에서 왔으면 결과 화면으로 돌아간다
    router.replace(isCreateFlow ? budgetLocation : '/account/me/survey');
  } catch (error) {
    showError(error, '설문을 저장하지 못했습니다.');
  } finally {
    submitting.value = false;
  }
};

// 등록 도중 나가면 1/3 에서 만든 워케이션이 반쪽으로 남는다
const cancelRegistration = async () => {
  if (canceling.value) return;
  canceling.value = true;
  try {
    await workationStore.deleteWorkation(workationId);
    localStorage.removeItem(`workation-budget-draft-${workationId}`);
    leaving.value = true;
    router.replace('/workation');
  } catch (error) {
    showError(error, '등록을 취소하지 못했습니다.');
  } finally {
    canceling.value = false;
    cancelOpen.value = false;
  }
};

const goBack = () => {
  // 첫 등록 도중 나가면 예산 없는 워케이션이 남는다
  if (isFirstCreateFlow) {
    cancelOpen.value = true;
    return;
  }

  // 이미 만들어진 워케이션의 설문만 고치러 온 것이라 그냥 예산으로 넘어간다
  if (isSurveyReuse) {
    leaving.value = true;
    router.replace(budgetLocation);
    return;
  }

  // 내 정보에서 왔다. push 로 되돌리면 이력이 쌓여 순환한다
  if (window.history.state?.back) {
    router.back();
    return;
  }
  router.push('/account/me/survey');
};

// 헤더 버튼뿐 아니라 브라우저 뒤로가기와 주소 직접 입력도 잡는다.
// 새로고침과 탭 닫기는 여기서 못 막는다. 그때는 홈의 이어서 설정하기 배너로 돌아온다
onBeforeRouteLeave(() => {
  if (!isFirstCreateFlow || leaving.value) return true;
  cancelOpen.value = true;
  return false;
});
</script>
