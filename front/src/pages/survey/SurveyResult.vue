<template>
  <div class="flex min-h-screen flex-col bg-white px-5 pt-4 pb-8">
    <header class="relative mb-4 flex items-center justify-center">
      <button
        type="button"
        class="absolute left-0 -ml-2 flex h-11 w-11 items-center justify-center text-slate-900"
        aria-label="뒤로 가기"
        @click="goBack"
      >
        <ChevronLeft class="h-7 w-7" />
      </button>
      <h1 class="text-base font-bold text-slate-900">나의 워케이션 스타일</h1>
    </header>

    <p v-if="loading" class="py-20 text-center text-sm text-slate-400">
      불러오는 중...
    </p>

    <template v-else-if="result">
      <h2 class="mt-2 text-lg font-bold text-slate-900">내가 선택한 응답</h2>
      <p class="mt-1 text-xs text-slate-400">
        선택한 취향을 바탕으로 워케이션 장소를 추천해드려요.
      </p>

      <div class="mt-5 flex-1 space-y-3">
        <div
          v-for="(question, index) in result.questions"
          :key="question.questionId"
          class="rounded-xl px-4 py-4"
          :class="CARD_TONES[index % CARD_TONES.length]"
        >
          <p class="text-xs text-slate-500">{{ question.question }}</p>
          <p class="mt-1.5 text-sm font-bold text-slate-900">
            {{ selectedTextOf(question) }}
          </p>
        </div>
      </div>

      <p class="mt-5 flex items-start gap-2 text-xs text-slate-400">
        <span
          class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] text-slate-500"
        >
          i
        </span>
        응답을 수정하면 추천 결과에도 반영돼요.
      </p>

      <Button class="mt-5 h-12 w-full rounded-xl text-base" @click="goEdit">
        수정하기
      </Button>
    </template>

    <div v-else class="flex flex-1 flex-col items-center justify-center">
      <p class="text-sm font-bold text-slate-900">
        아직 워케이션 스타일을 정하지 않았어요
      </p>
      <p class="mt-2 text-center text-xs leading-5 text-slate-400">
        워케이션을 등록하면 취향 설문을 진행하고,<br />
        그에 맞는 숙소와 공간을 추천해 드려요
      </p>
      <Button
        class="mt-6 h-12 w-full rounded-xl text-base"
        @click="goCreateWorkation"
      >
        워케이션 등록하기
      </Button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ChevronLeft } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { useSurveyStore } from '@/stores/surveyStore';
import { useErrorToast } from '@/composables/useErrorToast';

// 시안이 문항마다 다른 배경색을 쓴다
const CARD_TONES = [
  'bg-blue-50',
  'bg-emerald-50',
  'bg-amber-50',
  'bg-violet-50',
];

const router = useRouter();
const surveyStore = useSurveyStore();
const { showError } = useErrorToast();
const { result } = storeToRefs(surveyStore);

const loading = ref(true);

onMounted(async () => {
  try {
    await surveyStore.fetchMySurvey();
  } catch (error) {
    showError(error, '설문 결과를 불러오지 못했습니다.');
  } finally {
    loading.value = false;
  }
});

// 선택한 선택지 이름만 골라 줄바꿈 없이 이어 준다
const selectedTextOf = (question) => {
  const selected = new Set(question.selectedOptionIds ?? []);
  const names = (question.options ?? [])
    .filter((option) => selected.has(option.optionId))
    .map((option) => option.optionName);
  return names.length > 0 ? names.join(' · ') : '-';
};

const goEdit = () => {
  router.push('/account/me/survey/edit');
};

// 설문이 없는 사용자는 워케이션을 한 번도 등록하지 않은 경우뿐이다.
// 설문 생성은 첫 워케이션 등록 단계에 있고, 추천도 워케이션의 지역·기간이 있어야
// 돌아가므로 여기서 설문만 따로 만들게 하지 않는다
const goCreateWorkation = () => {
  router.push('/workation/create');
};

// push 로 되돌리면 히스토리가 쌓여 내 정보에서 다시 이 화면으로 들어온다.
// 왔던 곳으로 돌아가되, 주소를 직접 입력해 이력이 없으면 내 정보로 보낸다
const goBack = () => {
  if (window.history.state?.back) {
    router.back();
    return;
  }
  router.push('/account/me');
};
</script>
