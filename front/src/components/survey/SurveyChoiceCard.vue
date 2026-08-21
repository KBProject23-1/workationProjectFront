<template>
  <button
    type="button"
    class="relative flex min-h-[68px] items-center gap-3 rounded-card border-2 px-3 py-3 text-left transition"
    :class="[
      theme.background,
      selected ? `${theme.border} shadow-sm` : 'border-transparent',
    ]"
    @click="$emit('select', option.optionId)"
  >
    <img
      v-if="iconSrc"
      :src="iconSrc"
      :alt="`${option.optionText} 아이콘`"
      class="h-10 w-10 shrink-0 object-contain"
    />

    <span class="min-w-0 flex-1 text-center">
      <span class="block text-body font-bold text-ink">
        {{ option.optionText }}
      </span>
      <span
        v-if="optionDescription"
        class="mt-1 block text-caption leading-4 text-ink-mute"
      >
        {{ optionDescription }}
      </span>
    </span>

    <span
      v-if="selected"
      class="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full text-caption font-bold text-white"
      :class="theme.check"
    >
      ✓
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
});
defineEmits(['select']);

const iconSrc = computed(() => {
  const optionText = props.option?.optionText?.trim();
  return optionText ? (iconByFileName[optionText] ?? null) : null;
});

const themeByText = {
  예산: {
    background: 'bg-brand-weak',
    border: 'border-brand',
    check: 'bg-brand',
  },
  '이동 편의': {
    background: 'bg-teal-50',
    border: 'border-teal-400',
    check: 'bg-teal-400',
  },
  '높은 평점': {
    background: 'bg-violet-50',
    border: 'border-violet-500',
    check: 'bg-violet-500',
  },
  '균형 있게': {
    background: 'bg-warn-weak',
    border: 'border-amber-400',
    check: 'bg-amber-400',
  },
};

const theme = computed(
  () =>
    themeByText[props.option?.optionText] ?? {
      background: 'bg-white',
      border: 'border-slate-400',
      check: 'bg-slate-400',
    },
);

const descriptionByText = {
  예산: '가격이 가장 중요해요',
  '이동 편의': '이동이 가장 편리한 곳',
  '높은 평점': '평점이 높은 곳이 좋아요',
  '균형 있게': '모든 요소를 균형 있게',
};

const optionDescription = computed(
  () =>
    props.option?.optionDescription ??
    props.option?.description ??
    descriptionByText[props.option?.optionText] ??
    '',
);
</script>
