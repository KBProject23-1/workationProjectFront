<template>
  <div class="min-h-screen bg-white px-5 pt-4 pb-8">
    <div class="mb-4">
      <BaseHeader
        :title="pageTitle"
        variant="centered"
        title-class="text-base font-bold text-slate-900"
        @back="goBack"
      />
    </div>

    <!-- 설문은 사용자당 1회다. 이미 했으면 단계가 하나 줄어든다 -->
    <template v-if="!isEdit">
      <div class="h-1 w-full rounded-full bg-blue-100">
        <div
          class="h-1 rounded-full bg-blue-600"
          :class="totalSteps === 3 ? 'w-1/3' : 'w-1/2'"
        />
      </div>
      <p class="mt-1 text-right text-xs text-slate-400">1 / {{ totalSteps }}</p>
    </template>

    <h2 class="mt-4 mb-3 text-base font-bold text-slate-900">기본 정보</h2>

    <div class="space-y-4">
      <WorkationFormField label="제목" :error-message="errors.title">
        <Input
          v-model="form.title"
          maxlength="100"
          placeholder="예) 제주 귤따기 워케이션"
          class="placeholder:text-slate-300"
        />
      </WorkationFormField>

      <!--
        지역을 바꾸면 이미 잡아 둔 예약과 추천이 전부 쓸모없어진다.
        정리 비용이 삭제 후 재등록보다 커서 수정 대상에서 뺐다.
      -->
      <WorkationFormField
        label="지역"
        :hint="isEdit ? '지역은 변경할 수 없어요' : ''"
        :error-message="errors.regionId"
      >
        <select
          v-model="form.regionId"
          :disabled="isEdit"
          class="border-input h-9 w-full rounded-md border bg-transparent px-3 text-base md:text-sm disabled:bg-slate-50 disabled:text-slate-400"
          :class="form.regionId ? 'text-slate-900' : 'text-slate-300'"
        >
          <option :value="null" disabled class="text-slate-300">
            지역을 선택해 주세요
          </option>
          <option
            v-for="region in sortedRegions"
            :key="region.id"
            :value="region.id"
            class="text-slate-900"
          >
            {{ region.name }}
          </option>
        </select>
      </WorkationFormField>

      <!--
        이미 시작한 워케이션은 시작일을 바꿀 수 없다.
        지난 날짜로 옮기면 이미 쌓인 지출·예약의 기준이 흔들린다.
        아직 시작 전이면 앞뒤 모두 자유롭게 조정할 수 있다.
      -->
      <WorkationFormField
        label="기간"
        :hint="periodHint"
        :error-message="errors.period"
      >
        <div class="flex items-center gap-2">
          <WorkationDateInput
            v-model="form.startDate"
            placeholder="시작일"
            :disabled="startDateLocked"
            class="flex-1"
          />
          <span class="shrink-0 text-slate-400">~</span>
          <WorkationDateInput
            v-model="form.endDate"
            placeholder="종료일"
            class="flex-1"
          />
        </div>
      </WorkationFormField>

      <div class="grid grid-cols-2 gap-3">
        <WorkationFormField
          :label="`${workLabel} 예산 총액`"
          :error-message="errors.businessBudgetTotal"
        >
          <div class="relative">
            <Input
              :model-value="businessBudgetText"
              inputmode="numeric"
              class="pr-8 text-right"
              @update:model-value="onBusinessBudgetInput"
            />
            <span
              class="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400"
              >원</span
            >
          </div>
        </WorkationFormField>

        <WorkationFormField
          label="개인 예산 총액"
          :error-message="errors.personalBudgetTotal"
        >
          <div class="relative">
            <Input
              :model-value="personalBudgetText"
              inputmode="numeric"
              class="pr-8 text-right"
              @update:model-value="onPersonalBudgetInput"
            />
            <span
              class="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400"
              >원</span
            >
          </div>
        </WorkationFormField>
      </div>

      <p class="text-xs text-slate-400">
        다음 단계에서 취향을 고르고 카테고리별로 배정하게 돼요
      </p>
    </div>

    <BaseButton
      variant="default"
      class="mt-8 h-12 w-full rounded-xl text-base"
      :disabled="submitting"
      @click="submit"
    >
      {{ submitLabel }}
    </BaseButton>

    <BaseConfirmModal
      :visible="outOfPeriodOpen"
      title="기간을 줄이면 지출이 빠져요"
      :message="outOfPeriodMessage"
      :loading="submitting"
      @confirm="submitWithForce"
      @cancel="outOfPeriodOpen = false"
    />

    <!--
      법인카드가 없으면 회사 경비를 어떻게 관리할지 먼저 정해야 한다.
      등록할 때만 띄운다. 수정 화면에서 매번 뜨면 방해가 된다.
    -->
    <BaseConfirmModal
      :visible="cardNoticeOpen"
      title="법인카드가 등록되어 있지 않네요"
      message="회사 경비는 어떻게 관리하시겠어요?"
      confirm-label="법인카드 등록하기"
      cancel-label="개인카드로 쓰고 회사에 청구"
      @confirm="goCardLink"
      @cancel="cardNoticeOpen = false"
    />

    <!--
      두 번째 워케이션부터는 설문 화면을 건너뛴다.
      건너뛴다는 사실과 그 근거를 알리고, 취향이 바뀌었으면 고칠 기회를 준다.
    -->
    <BaseConfirmModal
      :visible="surveyReuseOpen"
      title="기존 설문을 바탕으로 추천해 드릴게요"
      :message="'지난번에 고른 워케이션 취향을 그대로 사용해요.\n취향이 바뀌었다면 지금 수정할 수 있어요.'"
      confirm-label="이대로 진행"
      cancel-label="설문 수정하기"
      content-class="max-h-[90dvh] max-w-sm overflow-y-auto"
      @confirm="goBudgetSetup"
      @cancel="goSurveyEdit"
    >
      <section class="space-y-3" aria-label="내가 선택한 설문 응답">
        <div
          v-for="(answer, index) in surveyAnswers"
          :key="answer.questionId"
          class="rounded-xl px-4 py-3.5"
          :class="SURVEY_CARD_TONES[index % SURVEY_CARD_TONES.length]"
        >
          <p class="text-xs leading-5 text-slate-500">{{ answer.question }}</p>
          <p class="mt-1 text-sm font-bold leading-5 text-slate-900">
            {{ answer.selectedText }}
          </p>
        </div>
      </section>
    </BaseConfirmModal>

    <!-- 기간이 바뀌면 예약이 어긋난다. 무엇이 걸리는지에 따라 안내가 갈린다 -->
    <BaseConfirmModal
      :visible="reservationOpen"
      title="일정이 변경되었습니다."
      :message="reservationMessage"
      :confirm-label="reservationConfirmLabel"
      :cancel-label="reservationCancelLabel"
      @confirm="goReservations"
      @cancel="goHome"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { Input } from '@/components/ui/input';
import BaseButton from '@/components/common/BaseButton.vue';
import { useBudgetStore } from '@/stores/budgetStore';
import { useWorkationStore } from '@/stores/workationStore';
import BaseHeader from '@/components/common/BaseHeader.vue';
import { useErrorToast } from '@/composables/useErrorToast';
import { useBudgetTypeLabel } from '@/composables/useBudgetTypeLabel';
import { useSurveyStore } from '@/stores/surveyStore';
import WorkationFormField from '@/components/workation/WorkationFormField.vue';
import WorkationDateInput from '@/components/workation/WorkationDateInput.vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';

const route = useRoute();
const router = useRouter();
const budgetStore = useBudgetStore();
const workationStore = useWorkationStore();
const { showError } = useErrorToast();
const { hasCorporateCard, workLabel, ensureCards } = useBudgetTypeLabel();
const surveyStore = useSurveyStore();

// 설문 결과 화면과 같은 색 순서로 기존 응답을 보여준다
const SURVEY_CARD_TONES = [
  'bg-blue-50',
  'bg-emerald-50',
  'bg-amber-50',
  'bg-violet-50',
];

const surveyAnswers = computed(() =>
  (surveyStore.result?.questions ?? []).map((question) => {
    const selectedOptionIds = new Set(question.selectedOptionIds ?? []);
    const selectedOptionNames = (question.options ?? [])
      .filter((option) => selectedOptionIds.has(option.optionId))
      .map((option) => option.optionName);

    return {
      questionId: question.questionId,
      question: question.question,
      selectedText: selectedOptionNames.join(' · ') || '-',
    };
  }),
);

// 설문은 사용자당 1회다. 이미 답했으면 등록이 2단계로 줄어든다
const surveyDone = computed(() => surveyStore.hasAnswered);
const totalSteps = computed(() => (surveyDone.value ? 2 : 3));

// 법인카드가 없을 때 등록 화면에서 한 번 안내한다
const cardNoticeOpen = ref(false);

const goCardLink = () => {
  cardNoticeOpen.value = false;
  router.push('/card/link');
};

// 라우트에 workationId 가 있으면 수정 화면으로 동작한다
const workationId = route.params.workationId ?? null;
const isEdit = Boolean(workationId);

const pageTitle = isEdit ? '워케이션 일정 수정하기' : '워케이션 일정 등록하기';

const submitting = ref(false);

// 기간 축소로 밀려나는 지출이 있을 때 확인받는다
const outOfPeriodOpen = ref(false);
const outOfPeriodMessage = ref('');

// 두 번째 워케이션 등록 시 기존 설문을 재사용한다는 안내
const surveyReuseOpen = ref(false);
const createdWorkationId = ref(null);

// 총예산을 바꾸면 기존 카테고리 배정 합계와 어긋난다. 저장 후 안내하려고 원래 값을 들고 있는다
const originalBudget = { business: '', personal: '' };

const budgetTotalChanged = () =>
  form.businessBudgetTotal !== originalBudget.business ||
  form.personalBudgetTotal !== originalBudget.personal;

// 기간이 바뀌면 잡아 둔 숙소·공유오피스 예약과 어긋난다
const originalPeriod = { start: '', end: '' };

const periodChanged = () =>
  form.startDate !== originalPeriod.start ||
  form.endDate !== originalPeriod.end;

// 이미 시작한 워케이션은 시작일을 못 바꾼다
const startDateLocked = computed(
  () => isEdit && workationStore.workation?.phase === 'ONGOING',
);

const periodHint = computed(() => {
  if (startDateLocked.value) return '진행 중이라 시작일은 바꿀 수 없어요';
  return totalDaysText.value;
});

// 기간 변경 후 예약을 어떻게 할지 물어본다
const reservationOpen = ref(false);
const reservationCheck = ref(null);

// 기간을 벗어난 예약 중 취소할 수 없는 것 (이미 이용이 시작됨)
const blockedReservation = computed(() =>
  (reservationCheck.value?.outOfPeriod ?? []).find((item) => !item.cancelable),
);

// 취소할 수 있는 것
const cancelableReservation = computed(() =>
  (reservationCheck.value?.outOfPeriod ?? []).find((item) => item.cancelable),
);

const reservationMessage = computed(() => {
  // 취소 규정에 막힌 예약이 있으면 그것부터 알린다. 사용자가 할 수 있는 게 없어서다
  if (blockedReservation.value) {
    return `${blockedReservation.value.merchantName} 예약 기간이 변경되었으나, 숙소 측 취소 규정 상 취소할 수 없습니다. 숙소에 직접 문의해 주세요.`;
  }
  if (cancelableReservation.value) {
    return `${cancelableReservation.value.merchantName} 예약을 변경하세요.`;
  }
  // availability 가 붙으면 "같은 숙소에서 더 묵으시겠어요?" 로 나뉜다
  return '늘어난 기간에 묵을 곳이 없어요.';
});

const reservationConfirmLabel = computed(() => {
  if (blockedReservation.value) return '예약 내역 확인하기';
  if (cancelableReservation.value) return '예약 확인하러 가기';
  return '숙소 예약하러 가기';
});

const reservationCancelLabel = computed(() =>
  blockedReservation.value ? '확인' : '나중에',
);

const submitLabel = computed(() => {
  if (submitting.value) return '저장 중...';
  return isEdit ? '저장' : '다음';
});

const sortedRegions = computed(() => workationStore.sortedRegions);

const form = reactive({
  title: '',
  regionId: null,
  startDate: '',
  endDate: '',
  businessBudgetTotal: '',
  personalBudgetTotal: '',
});

const errors = reactive({
  title: '',
  regionId: '',
  period: '',
  businessBudgetTotal: '',
  personalBudgetTotal: '',
});

const loadRegions = async () => {
  try {
    await workationStore.fetchRegions();
  } catch (error) {
    showError(error, '지역 목록을 불러오지 못했습니다.');
  }
};

// 수정 대상은 진행 중 워케이션 하나뿐이라 current 로 채운다
const loadWorkation = async () => {
  try {
    await workationStore.fetchCurrent();
    const workation = workationStore.workation;
    if (!workation) {
      router.replace('/workation');
      return;
    }

    form.title = workation.title ?? '';
    form.regionId = workation.region?.id ?? null;
    form.startDate = workation.startDate ?? '';
    form.endDate = workation.endDate ?? '';

    originalPeriod.start = form.startDate;
    originalPeriod.end = form.endDate;

    const budgets = await budgetStore.fetchBudgets(workation.id);
    budgets.forEach((budget) => {
      const amount = String(Number(budget.budgetTotal ?? 0));
      if (budget.budgetType === 'WORK') form.businessBudgetTotal = amount;
      if (budget.budgetType === 'PERSONAL') form.personalBudgetTotal = amount;
    });

    originalBudget.business = form.businessBudgetTotal;
    originalBudget.personal = form.personalBudgetTotal;
  } catch (error) {
    showError(error, '워케이션 정보를 불러오지 못했습니다.');
  }
};

// 등록 화면인데 이미 진행 중 워케이션이 있으면 들어올 수 없다
const guardCreate = async () => {
  await workationStore.fetchCurrent();
  if (workationStore.hasActive) {
    showError(null, '이미 진행 중인 워케이션이 있습니다.');
    router.replace('/workation');
  }
};

onMounted(async () => {
  await Promise.all([
    loadRegions(),
    ensureCards(),
    // 설문 이력이 있으면 단계 표기와 다음 화면이 달라진다.
    // 응답이 없으면 404 가 오므로 스토어가 삼킨다
    surveyStore.fetchMySurvey().catch(() => {}),
    isEdit ? loadWorkation() : guardCreate(),
  ]);

  // 예산 총액을 입력하기 전에 안내해야 의미가 있다
  if (!isEdit && !hasCorporateCard.value) {
    cardNoticeOpen.value = true;
  }
});

// 숫자만 남기고 화면에는 천 단위 콤마를 붙여 보여준다
const toDigits = (value) => String(value ?? '').replace(/[^\d]/g, '');

const withComma = (value) => {
  const digits = toDigits(value);
  return digits === '' ? '' : Number(digits).toLocaleString('ko-KR');
};

const businessBudgetText = computed(() => withComma(form.businessBudgetTotal));
const personalBudgetText = computed(() => withComma(form.personalBudgetTotal));

const onBusinessBudgetInput = (value) => {
  form.businessBudgetTotal = toDigits(value);
};

const onPersonalBudgetInput = (value) => {
  form.personalBudgetTotal = toDigits(value);
};

// 시작일과 종료일을 모두 고른 경우에만 일수를 보여준다. 양 끝날을 포함해서 센다
const totalDays = computed(() => {
  if (!form.startDate || !form.endDate) return 0;
  const start = new Date(form.startDate);
  const end = new Date(form.endDate);
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 0;
});

const totalDaysText = computed(() =>
  totalDays.value > 0 ? `총 ${totalDays.value}일` : '',
);

const validate = () => {
  errors.title = '';
  errors.regionId = '';
  errors.period = '';
  errors.businessBudgetTotal = '';
  errors.personalBudgetTotal = '';

  if (!form.title.trim()) {
    errors.title = '제목을 입력해 주세요.';
  } else if (form.title.length > 100) {
    errors.title = '제목은 100자까지 입력할 수 있습니다.';
  }

  if (!form.regionId) {
    errors.regionId = '지역을 선택해 주세요.';
  }

  if (!form.startDate || !form.endDate) {
    errors.period = '기간을 선택해 주세요.';
  } else if (form.endDate < form.startDate) {
    errors.period = '종료일은 시작일 이후여야 합니다.';
  }

  if (form.businessBudgetTotal === '') {
    errors.businessBudgetTotal = `${workLabel.value} 예산을 입력해 주세요.`;
  }

  if (form.personalBudgetTotal === '') {
    errors.personalBudgetTotal = '개인 예산을 입력해 주세요.';
  }

  return Object.values(errors).every((message) => message === '');
};

// 설문을 건너뛰므로 등록은 일정·예산 2단계다
const goBudgetSetup = () => {
  surveyReuseOpen.value = false;
  router.push(
    `/workation/${createdWorkationId.value}/budgets?step=create&steps=2`,
  );
};

// 등록 흐름 안에서 설문만 고치러 간다.
// reuse=1 이 붙으면 설문 화면이 저장·뒤로가기 모두 예산으로 이어 준다.
// 첫 등록(step=create 단독)과 달리 뒤로가기로 워케이션을 지우지 않는다
const goSurveyEdit = () => {
  surveyReuseOpen.value = false;
  router.push(
    `/workation/${createdWorkationId.value}/survey?step=create&reuse=1`,
  );
};

const buildPayload = () => ({
  title: form.title.trim(),
  regionId: form.regionId,
  startDate: form.startDate,
  endDate: form.endDate,
  businessBudgetTotal: Number(form.businessBudgetTotal),
  personalBudgetTotal: Number(form.personalBudgetTotal),
});

const save = async (force) => {
  submitting.value = true;
  try {
    const data = isEdit
      ? await workationStore.updateWorkation(workationId, buildPayload(), force)
      : await workationStore.createWorkation(buildPayload());

    const id = data.id ?? workationId;

    // 설문을 아직 안 했으면 설문으로 이어진다.
    //
    // 이미 했으면 설문 화면을 건너뛰는데, 아무 말 없이 넘어가면
    // 무엇을 근거로 추천하는지 알 수 없다. 기존 응답을 쓴다고 알리고
    // 고칠 기회를 준 뒤 예산으로 보낸다
    if (!isEdit) {
      if (surveyDone.value) {
        createdWorkationId.value = id;
        surveyReuseOpen.value = true;
        return;
      }
      router.push(`/workation/${id}/survey?step=create`);
      return;
    }

    // 수정은 여기서 끝낸다.
    // 예전에는 배분 화면으로 이어붙였는데, 그러면 등록 흐름(step=create)에 올라타서
    // 뒤로가기가 설문까지 거슬러 올라갔다. 세부 예산은 메인의 별도 진입점으로 고친다.
    if (budgetTotalChanged()) {
      toast('총예산이 바뀌었어요. 세부 예산도 다시 배정해 주세요.');
    }

    // 기간이 바뀌었으면 예약이 어긋난다.
    // 저장을 먼저 하고 조회한다. 예약을 고치려면 새 기간이 반영돼 있어야 한다
    // (예약 생성 시 워케이션 기간 안인지 검증한다)
    if (periodChanged()) {
      await loadReservationCheck(id);
      return;
    }
    router.push('/workation');
  } catch (error) {
    const errorCode = error.response?.data?.errorCode;

    if (errorCode === 'ALREADY_ACTIVE') {
      showError(error, '이미 진행 중인 워케이션이 있습니다.');
      return;
    }
    if (errorCode === 'REGION_NOT_FOUND') {
      errors.regionId = '존재하지 않는 지역입니다.';
      return;
    }
    // 기간을 줄여 지출이 밀려나는 경우. 몇 건이 빠지는지 알려주고 다시 물어본다
    if (errorCode === 'EXPENSE_OUT_OF_PERIOD') {
      outOfPeriodMessage.value = `${error.message} 앱 결제 건은 기간을 다시 늘리면 돌아오지만, 직접 등록한 건은 되돌릴 수 없어요.`;
      outOfPeriodOpen.value = true;
      return;
    }

    showError(error, `워케이션을 ${isEdit ? '수정' : '등록'}하지 못했습니다.`);
  } finally {
    submitting.value = false;
  }
};

const submit = async () => {
  if (!validate() || submitting.value) return;
  await save(false);
};

const submitWithForce = async () => {
  if (submitting.value) return;
  outOfPeriodOpen.value = false;
  await save(true);
};

// 어긋나는 예약이 없으면 팝업 없이 그냥 홈으로 간다
const loadReservationCheck = async (id) => {
  try {
    const result = await workationStore.checkReservations(id);

    if (!result.needsAction) {
      router.push('/workation');
      return;
    }
    reservationCheck.value = result;
    reservationOpen.value = true;
  } catch (error) {
    // 조회에 실패해도 저장은 이미 끝났다. 알리고 넘어간다
    showError(error, '예약 상태를 확인하지 못했습니다.');
    router.push('/workation');
  }
};

const goReservations = () => {
  reservationOpen.value = false;
  router.replace('/reservations');
};

const goHome = () => {
  reservationOpen.value = false;
  router.replace('/workation');
};

const goBack = () => {
  router.push('/workation');
};
</script>
