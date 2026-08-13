import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { useErrorToast } from '@/composables/useErrorToast';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useWorkationStore } from '@/stores/workationStore';

export function useScheduleRegistration(merchant, fetchMerchant) {
  const scheduleStore = useScheduleStore();
  const workationStore = useWorkationStore();
  const router = useRouter();
  const { isCreating } = storeToRefs(scheduleStore);
  const { workation } = storeToRefs(workationStore);
  const { showError } = useErrorToast();
  const selectedDate = ref('');
  const selectedTime = ref('10:00');
  const confirmVisible = ref(false);
  const registrationError = ref('');

  const registrationDisabled = computed(
    () => !workation.value || !merchant.value?.merchantId,
  );
  const registrationMessage = computed(() => {
    if (registrationError.value) return registrationError.value;
    if (workationStore.error && !workation.value) return '워케이션 정보를 불러오지 못했습니다.';
    if (!workation.value) return '진행 중인 워케이션이 없어 일정을 등록할 수 없습니다.';
    return '';
  });
  const confirmMessage = computed(
    () => `${selectedDate.value} ${selectedTime.value}에 ${merchant.value?.merchantName ?? ''} 일정을 등록합니다.`,
  );

  function localDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function initializeSelectedDate() {
    if (!workation.value?.startDate || !workation.value?.endDate) return;
    const today = localDateString(new Date());
    selectedDate.value = today < workation.value.startDate
      ? workation.value.startDate
      : today > workation.value.endDate
        ? workation.value.endDate
        : today;
  }

  function requestRegistration() {
    if (registrationDisabled.value || !selectedDate.value || !selectedTime.value) return;
    registrationError.value = '';
    confirmVisible.value = true;
  }

  async function registerSchedule() {
    try {
      const result = await scheduleStore.createSchedule(workationStore.workationId, {
        merchantId: merchant.value.merchantId,
        scheduledAt: `${selectedDate.value}T${selectedTime.value}:00`,
      });
      if (!result) return;
      confirmVisible.value = false;
      toast.success('일정이 등록되었습니다.');
      await router.push({ name: 'WorkationHome' });
    } catch (error) {
      registrationError.value = '일정을 등록하지 못했습니다. 선택한 날짜와 시간을 확인해 주세요.';
      confirmVisible.value = false;
      showError(error, '일정을 등록하지 못했습니다.');
    }
  }

  onMounted(async () => {
    await Promise.all([
      fetchMerchant(),
      workation.value ? Promise.resolve() : workationStore.fetchCurrent(),
    ]);
    initializeSelectedDate();
  });

  return {
    workation,
    isCreating,
    selectedDate,
    selectedTime,
    confirmVisible,
    registrationDisabled,
    registrationMessage,
    confirmMessage,
    requestRegistration,
    registerSchedule,
  };
}
