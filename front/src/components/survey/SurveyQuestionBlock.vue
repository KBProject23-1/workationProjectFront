<template>
  <section>
    <h2 class="text-base leading-6 font-bold text-slate-900">
      {{ order }}. {{ question.questionText }}
      <span
        v-if="isLeisureActivity"
        class="ml-1 whitespace-nowrap text-xs font-medium text-slate-400"
      >
        (최대 {{ maxSelections }}개 선택)
      </span>
    </h2>

    <p
      v-if="questionHint"
      :class="
        isOfficeAtmosphere
          ? 'mt-5 text-sm text-slate-400'
          : isCardStyle
            ? 'mt-1 text-sm text-slate-400'
            : isLeisureActivity
              ? 'mt-3 text-sm text-slate-400'
              : isMealStyle
                ? 'mt-2 text-sm text-slate-400'
                : 'mt-1 text-xs text-slate-400'
      "
    >
      {{ questionHint }}
    </p>

    <!-- 카드형: 첫 문항만 시안이 2x2 카드다 -->
    <div v-if="isCardStyle" class="mt-4 grid grid-cols-2 gap-3">
      <SurveyChoiceCard
        v-for="option in question.options"
        :key="option.optionId"
        :option="option"
        :selected="selected.includes(option.optionId)"
        @select="pickOne"
      />
    </div>

    <!-- 복수 선택: 2열 체크박스 -->
    <div
      v-else-if="isMultiple"
      :class="
        isLeisureActivity
          ? 'mt-3 grid grid-cols-2 gap-2'
          : 'mt-4 grid grid-cols-2 gap-2'
      "
    >
      <SurveyCheckOption
        v-for="option in question.options"
        :key="option.optionId"
        :option="option"
        :selected="selected.includes(option.optionId)"
        :disabled="reachedMax && option.optionCode !== EXCLUSIVE_CODE"
        :special="option.optionCode === EXCLUSIVE_CODE"
        @toggle="toggle"
      />
    </div>

    <!-- 단일 선택: 세로 목록 -->
    <div
      v-else
      :class="
        isOfficeAtmosphere || isMealStyle
          ? 'mt-3 space-y-2.5'
          : 'mt-4 space-y-2'
      "
    >
      <SurveyRadioOption
        v-for="option in question.options"
        :key="option.optionId"
        :option="option"
        :selected="selected.includes(option.optionId)"
        :detailed="isOfficeAtmosphere"
        :meal-style="isMealStyle"
        @select="pickOne"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import SurveyChoiceCard from './SurveyChoiceCard.vue';
import SurveyRadioOption from './SurveyRadioOption.vue';
import SurveyCheckOption from './SurveyCheckOption.vue';

// 서버에 배타 처리가 없어 프론트에서 막는다
const EXCLUSIVE_CODE = 'NONE';
// 시안에서 카드형으로 그려진 문항
const CARD_QUESTION_CODE = 'PRIORITY_FACTOR';

const props = defineProps({
  question: { type: Object, required: true },
  selected: { type: Array, default: () => [] },
  order: { type: Number, required: true },
});

const emit = defineEmits(['change']);

const isMultiple = computed(
  () => props.question.questionType === 'MULTIPLE_CHOICE',
);

const isCardStyle = computed(
  () => props.question.questionCode === CARD_QUESTION_CODE,
);

const isOfficeAtmosphere = computed(() => {
  const optionTexts = props.question.options?.map(
    (option) => option.optionText,
  );

  return (
    optionTexts?.includes('조용하고 집중하기 좋은 공간') &&
    optionTexts?.includes('자유롭고 개방적인 공간')
  );
});

const isLeisureActivity = computed(() => {
  const optionTexts = props.question.options?.map(
    (option) => option.optionText,
  );

  return (
    optionTexts?.includes('수상 레포츠') &&
    optionTexts?.includes('특별히 없음')
  );
});

const isMealStyle = computed(() => {
  const optionTexts = props.question.options?.map(
    (option) => option.optionText,
  );

  return (
    optionTexts?.includes('균형형') &&
    optionTexts?.includes('저녁 집중형') &&
    optionTexts?.includes('아침 제외형')
  );
});

const maxSelections = computed(() => props.question.maxSelections ?? 1);

const reachedMax = computed(
  () => isMultiple.value && props.selected.length >= maxSelections.value,
);

const maxHint = computed(() =>
  isMultiple.value && maxSelections.value > 1
    ? `최대 ${maxSelections.value}개 선택`
    : '',
);

const questionHint = computed(() =>
  isOfficeAtmosphere.value
    ? '선호하는 공유오피스 분위기를 알려주세요.'
    : isCardStyle.value
      ? '추천 시 평가 요소의 중요도를 결정하는 질문입니다.'
      : isLeisureActivity.value
        ? '선택하신 활동이 일치하는 장소를 우선 추천해드려요.'
        : isMealStyle.value
          ? '선호하는 식사 스타일을 선택해주세요.'
          : maxHint.value,
);

const exclusiveId = computed(
  () =>
    props.question.options?.find(
      (option) => option.optionCode === EXCLUSIVE_CODE,
    )?.optionId ?? null,
);

const pickOne = (optionId) => {
  emit('change', props.question.questionId, [optionId]);
};

const toggle = (optionId) => {
  // '특별히 없음' 은 다른 선택을 모두 지우고 혼자만 남는다
  if (optionId === exclusiveId.value) {
    const next = props.selected.includes(optionId) ? [] : [optionId];
    emit('change', props.question.questionId, next);
    return;
  }

  const withoutExclusive = props.selected.filter(
    (id) => id !== exclusiveId.value,
  );

  if (withoutExclusive.includes(optionId)) {
    emit(
      'change',
      props.question.questionId,
      withoutExclusive.filter((id) => id !== optionId),
    );
    return;
  }

  if (withoutExclusive.length >= maxSelections.value) return;

  emit('change', props.question.questionId, [...withoutExclusive, optionId]);
};
</script>
