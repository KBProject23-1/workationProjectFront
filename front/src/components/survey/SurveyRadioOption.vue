<template>
  <button
    type="button"
    class="flex w-full items-center rounded-xl border text-left transition"
    :class="
      [
        detailed
          ? 'min-h-[70px] gap-3 px-3 py-3'
          : mealStyle
            ? 'min-h-[70px] gap-4 px-6 py-3'
            : 'gap-3 px-4 py-4',
        selected
          ? 'border-2 border-blue-500 bg-white'
          : 'border-slate-200 bg-white',
      ]
    "
    @click="$emit('select', option.optionId)"
  >
    <span
      class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
      :class="selected ? 'border-blue-500' : 'border-slate-300'"
    >
      <span v-if="selected" class="h-2.5 w-2.5 rounded-full bg-blue-500" />
    </span>

    <img
      v-if="detailed && iconSrc"
      :src="iconSrc"
      :alt="`${option.optionText} 아이콘`"
      class="h-10 w-10 shrink-0 object-contain"
    />

    <span class="min-w-0 flex-1">
      <span class="block text-sm font-bold text-slate-900">
        {{ option.optionText }}
      </span>
      <span
        v-if="(detailed || mealStyle) && optionDescription"
        class="mt-1 block text-xs leading-5 text-slate-400"
      >
        {{ optionDescription }}
      </span>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const iconModules = import.meta.glob('/src/assets/icons/survey/*.svg', {
  eager: true,
  import: 'default',
});

const iconByFileName = Object.fromEntries(
  Object.entries(iconModules).map(([path, src]) => {
    const fileName = path.split('/').pop().replace(/\.svg$/, '');
    return [fileName, src];
  }),
);

const props = defineProps({
  option: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  detailed: { type: Boolean, default: false },
  mealStyle: { type: Boolean, default: false },
});

defineEmits(['select']);

const iconSrc = computed(() => {
  const optionText = props.option?.optionText?.trim();
  return optionText ? (iconByFileName[optionText] ?? null) : null;
});

const descriptionByText = {
  '조용하고 집중하기 좋은 공간': '몰입하여 업무에 집중할 수 있는 환경',
  '자유롭고 개방적인 공간':
    '자유로운 분위기에서 소통하며 일할 수 있는 환경',
  균형형: '아침, 점심, 저녁을 균형 있게 즐기는 스타일',
  '저녁 집중형': '아침과 점심은 가볍게, 저녁은 든든하게 즐기는 스타일',
  '아침 제외형': '아침은 거르고, 점심과 저녁을 즐기는 스타일',
};

const optionDescription = computed(
  () =>
    props.option?.optionDescription ??
    props.option?.description ??
    descriptionByText[props.option?.optionText] ??
    '',
);
</script>
