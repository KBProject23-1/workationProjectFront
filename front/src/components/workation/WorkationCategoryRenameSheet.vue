<template>
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
    @click.self="close"
  >
    <div class="w-full max-w-md rounded-t-2xl bg-white px-5 pt-5 pb-8">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900">카테고리 이름 변경</h2>
          <p class="mt-1 text-xs text-slate-400">
            회사에서 쓰는 계정과목 이름으로 바꿀 수 있어요
          </p>
        </div>
        <button class="text-lg text-slate-400" @click="close">×</button>
      </div>

      <div class="mt-5">
        <p class="mb-1.5 text-xs text-slate-500">기존 카테고리명</p>
        <div class="rounded-md bg-slate-50 px-3 py-2">
          <p class="text-sm font-bold text-slate-900">
            {{ category.defaultName ?? category.name }}
          </p>
          <p class="text-xs text-slate-400">{{ category.description }}</p>
        </div>
      </div>

      <div class="mt-4">
        <div class="mb-1.5 flex items-baseline justify-between">
          <label class="text-xs text-slate-500"
            >우리 회사에서 부르는 이름</label
          >
          <span class="text-xs text-slate-400"
            >{{ customName.length }} / 20</span
          >
        </div>
        <Input
          v-model="customName"
          maxlength="20"
          class="placeholder:text-slate-300"
        />
      </div>

      <p class="mt-3 rounded-md bg-blue-50 px-3 py-2 text-xs text-slate-500">
        이름만 바뀌고 분류 기준은 그대로예요. 지금까지 등록한 지출도 그대로
        집계됩니다
      </p>

      <div class="mt-6 flex gap-2">
        <Button
          variant="outline"
          class="h-11 flex-1 rounded-xl text-sm"
          :disabled="saving"
          @click="reset"
        >
          기본값으로
        </Button>
        <Button
          class="h-11 flex-1 rounded-xl text-sm"
          :disabled="saving"
          @click="save"
        >
          {{ saving ? '저장 중...' : '저장' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
