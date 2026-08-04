<template>
  <div class="min-h-screen bg-white px-5 pt-4 pb-8">
    <header class="relative mb-4 flex items-center justify-center">
      <button class="absolute left-0 text-xl text-slate-900" @click="goBack">‹</button>
      <h1 class="text-base font-bold text-slate-900">워케이션 일정 등록하기</h1>
    </header>

    <div class="h-1 w-full rounded-full bg-blue-100">
      <div class="h-1 w-1/2 rounded-full bg-blue-600" />
    </div>
    <p class="mt-1 text-right text-xs text-slate-400">1 / 2</p>

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

      <WorkationFormField label="지역" :error-message="errors.regionId">
        <select
          v-model="form.regionId"
          class="border-input h-9 w-full rounded-md border bg-transparent px-3 text-base md:text-sm"
          :class="form.regionId ? 'text-slate-900' : 'text-slate-300'"
        >
          <option :value="null" disabled>지역을 선택해 주세요</option>
          <option v-for="region in regions" :key="region.id" :value="region.id">
            {{ region.name }}
          </option>
        </select>
      </WorkationFormField>

      <WorkationFormField label="기간" :hint="totalDaysText" :error-message="errors.period">
        <div class="flex items-center gap-2">
          <WorkationDateInput v-model="form.startDate" placeholder="시작일" class="flex-1" />
          <span class="shrink-0 text-slate-400">~</span>
          <WorkationDateInput v-model="form.endDate" placeholder="종료일" class="flex-1" />
        </div>
      </WorkationFormField>

      <div class="grid grid-cols-2 gap-3">
        <WorkationFormField label="법인 예산 총액" :error-message="errors.businessBudgetTotal">
          <div class="relative">
            <Input
              :model-value="businessBudgetText"
              inputmode="numeric"
              class="pr-8 text-right"
              @update:model-value="onBusinessBudgetInput"
            />
            <span class="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400">원</span>
          </div>
        </WorkationFormField>

        <WorkationFormField label="개인 예산 총액" :error-message="errors.personalBudgetTotal">
          <div class="relative">
            <Input
              :model-value="personalBudgetText"
              inputmode="numeric"
              class="pr-8 text-right"
              @update:model-value="onPersonalBudgetInput"
            />
            <span class="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400">원</span>
          </div>
        </WorkationFormField>
      </div>

      <p class="text-xs text-slate-400">다음 단계에서 카테고리별로 배정하게 돼요</p>
    </div>

    <Button class="mt-8 h-12 w-full rounded-xl text-base" :disabled="submitting" @click="submit">
      {{ submitting ? '등록 중...' : '다음' }}
    </Button>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getRegions, createWorkation } from '@/api/workation';
import { useErrorToast } from '@/composables/useErrorToast';
import WorkationFormField from '@/components/workation/WorkationFormField.vue';
import WorkationDateInput from '@/components/workation/WorkationDateInput.vue';

const router = useRouter();
const { showError } = useErrorToast();

const regions = ref([]);
const submitting = ref(false);

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
    const { data } = await getRegions();
    regions.value = data.regions ?? [];
  } catch (error) {
    showError(error, '지역 목록을 불러오지 못했습니다.');
  }
};

onMounted(loadRegions);

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

const totalDaysText = computed(() => (totalDays.value > 0 ? `총 ${totalDays.value}일` : ''));

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
    errors.businessBudgetTotal = '법인 예산을 입력해 주세요.';
  }

  if (form.personalBudgetTotal === '') {
    errors.personalBudgetTotal = '개인 예산을 입력해 주세요.';
  }

  return Object.values(errors).every((message) => message === '');
};

const submit = async () => {
  if (!validate() || submitting.value) return;

  submitting.value = true;
  try {
    await createWorkation({
      title: form.title.trim(),
      regionId: form.regionId,
      startDate: form.startDate,
      endDate: form.endDate,
      businessBudgetTotal: Number(form.businessBudgetTotal),
      personalBudgetTotal: Number(form.personalBudgetTotal),
    });
    // 예산 세부 금액 설정 화면이 아직 없다. 화면이 생기면 응답의 id 를 넘겨 그쪽으로 이동한다
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
    showError(error, '워케이션을 등록하지 못했습니다.');
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  router.back();
};
</script>
