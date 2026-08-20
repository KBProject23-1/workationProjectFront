<template>
  <div class="flex min-h-screen flex-col bg-canvas px-5 pt-4 pb-8">
    <div class="mb-4">
      <BaseHeader
        title="나의 워케이션 스타일"
        @back="goBack"
      />
    </div>

    <LoadingScreen v-if="loading" title="설문 결과를 불러오고 있어요" :fullscreen="false" />

    <template v-else-if="result">
      <h2 class="mt-2 text-heading font-bold text-ink">내가 선택한 응답</h2>
      <p class="mt-1 text-body-sm text-ink-mute">
        선택한 취향을 바탕으로 워케이션 장소를 추천해드려요.
      </p>

      <div class="mt-5 flex-1 space-y-3">
        <div
          v-for="(question, index) in result.questions"
          :key="question.questionId"
          class="rounded-card px-4 py-4"
          :class="SURVEY_CARD_TONES[index % SURVEY_CARD_TONES.length]"
        >
          <p class="text-body-sm text-ink-sub">{{ question.question }}</p>
          <p class="mt-1.5 text-body font-bold text-ink">
            {{ selectedOptionsText(question) }}
          </p>
        </div>
      </div>

      <p class="mt-5 flex items-start gap-2 text-body-sm text-ink-mute">
        <span
          class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-200 text-caption text-ink-sub"
        >
          i
        </span>
        응답을 수정하면 추천 결과에도 반영돼요.
      </p>

      <BaseButton variant="default" class="mt-5 w-full" @click="goEdit">
        수정하기
      </BaseButton>
    </template>

    <div v-else class="flex flex-1 flex-col items-center justify-center">
      <p class="text-body font-bold text-ink">
        아직 워케이션 스타일을 정하지 않았어요
      </p>
      <p class="mt-2 text-center text-body-sm leading-5 text-ink-mute">
        워케이션을 등록하면 취향 설문을 진행하고,<br />
        그에 맞는 숙소와 공간을 추천해 드려요
      </p>
      <BaseButton
        variant="default"
        class="mt-6 w-full"
        @click="goCreateWorkation"
      >
        워케이션 등록하기
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import BaseButton from '@/components/common/BaseButton.vue';
import { useSurveyStore } from '@/stores/surveyStore';
import { useErrorToast } from '@/composables/useErrorToast';
import BaseHeader from '@/components/common/BaseHeader.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import { SURVEY_CARD_TONES, selectedOptionsText } from '@/components/workation/format';

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
