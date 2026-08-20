<template>
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-navy/45"
    @click.self="close"
  >
    <div
      class="rounded-t-sheet bg-surface w-full max-w-[430px] px-5 pt-5 pb-8"
    >
      <span class="bg-line mx-auto mb-4 block h-1 w-9 rounded-full" />

      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-title font-bold -tracking-[0.01em] text-ink">
            카테고리 이름 변경
          </h2>
          <p class="text-body-sm mt-1 text-ink-mute">
            회사에서 쓰는 계정과목 이름으로 바꿀 수 있어요
          </p>
        </div>
        <button
          class="bg-canvas flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-sub"
          aria-label="닫기"
          @click="close"
        >
          <X :size="16" />
        </button>
      </div>

      <div class="mt-5">
        <p class="text-body-sm mb-2 font-semibold text-ink-sub">
          기존 카테고리명
        </p>
        <div class="rounded-chip bg-canvas px-3.5 py-3">
          <p class="text-body font-semibold text-ink">
            {{ category.defaultName ?? category.name }}
          </p>
          <p class="text-body-sm mt-0.5 text-ink-mute">
            {{ category.description }}
          </p>
        </div>
      </div>

      <div class="mt-4">
        <div class="mb-2 flex items-baseline justify-between">
          <label class="text-body-sm font-semibold text-ink-sub">
            우리 회사에서 부르는 이름
          </label>
          <span class="text-body-sm text-ink-mute">
            {{ customName.length }} / 20
          </span>
        </div>
        <Input
          v-model="customName"
          maxlength="20"
          class="rounded-chip text-body h-12 placeholder:text-ink-mute"
        />
      </div>

      <!-- 두 문장을 붙여 두면 줄바꿈 자리가 화면 폭에 따라 달라진다 -->
      <div class="rounded-chip bg-brand-weak text-body-sm mt-3 px-3.5 py-3 text-ink-sub">
        <p>이름만 바뀌고 분류 기준은 그대로예요.</p>
        <p class="mt-0.5">지금까지 등록한 지출도 그대로 집계됩니다</p>
      </div>

      <div class="mt-6 flex gap-2.5">
        <button
          class="rounded-card bg-canvas text-body h-[52px] flex-1 font-bold text-ink-sub transition-transform active:scale-[0.98] disabled:opacity-50"
          :disabled="saving"
          @click="reset"
        >
          기본값으로
        </button>
        <BaseButton
          variant="default"
          class="flex-1"
          :disabled="saving"
          @click="save"
        >
          {{ saving ? '저장 중...' : '저장' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { X } from '@lucide/vue';
import { Input } from '@/components/ui/input';
import BaseButton from '@/components/common/BaseButton.vue';
import { useCategoryStore } from '@/stores/categoryStore';
import { useErrorToast } from '@/composables/useErrorToast';

const props = defineProps({
  category: { type: Object, required: true },
});

const emit = defineEmits(['saved', 'close']);

const categoryStore = useCategoryStore();
const { showError } = useErrorToast();

// 별칭을 지정한 적이 없으면 빈 칸으로 시작한다. 기본 이름을 그대로 별칭으로 저장하지 않기 위함이다
const customName = ref(
  props.category.name !== props.category.defaultName
    ? (props.category.name ?? '')
    : '',
);
const saving = ref(false);

const close = () => {
  emit('close');
};

// customName 을 null 로 보내면 서버가 기본 이름으로 되돌린다
const submit = async (value) => {
  if (saving.value) return;
  saving.value = true;
  try {
    const data = await categoryStore.renameCategory(props.category.id, value);
    emit('saved', { categoryId: props.category.id, name: data.displayName });
  } catch (error) {
    showError(error, '이름을 변경하지 못했습니다.');
  } finally {
    saving.value = false;
  }
};

const save = () => {
  const value = customName.value.trim();
  submit(value === '' ? null : value);
};

const reset = () => {
  submit(null);
};
</script>
