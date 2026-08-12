<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { toast } from 'vue-sonner';
import { useAuthStore } from '@/stores/authStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { getDeviceId } from '@/utils/device';
import { getCurrentUserId } from '@/utils/currentUser';
import { markPinRegistered } from '@/utils/pinRegistry';
import PinKeypad from '@/components/pin/PinKeypad.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { showError } = useErrorToast();

// enter: 최초 입력, confirm: 확인 입력(한 번 더)
const phase = ref('enter');
const firstPin = ref('');
const pin = ref('');
const error = ref('');
const submitting = ref(false);

const title = computed(() =>
  phase.value === 'enter'
    ? '결제에 사용할 PIN을 설정해주세요'
    : 'PIN을 한 번 더 입력해주세요',
);
const description = computed(() =>
  phase.value === 'enter' ? '6자리 숫자를 입력해주세요' : '',
);

function resetToEnter(msg) {
  phase.value = 'enter';
  firstPin.value = '';
  pin.value = '';
  error.value = msg || '';
}

async function handleComplete(value) {
  if (phase.value === 'enter') {
    firstPin.value = value;
    pin.value = '';
    error.value = '';
    phase.value = 'confirm';
    return;
  }
  // confirm 단계: 두 입력이 같아야 등록
  if (value !== firstPin.value) {
    resetToEnter('PIN이 일치하지 않아요. 다시 설정해주세요.');
    return;
  }
  await submit(value);
}

async function submit(pinNumber) {
  submitting.value = true;
  error.value = '';
  // deviceId 는 기기 신원(설치 ID)이라 이미 발급·저장돼 있다. 그대로 재사용.
  const deviceId = getDeviceId();
  const userId = getCurrentUserId();
  try {
    await authStore.setupPin({
      pinNumber,
      deviceId,
      deviceName: buildDeviceName(),
    });
    if (userId != null) markPinRegistered(userId);
    toast.success('PIN이 설정됐어요');
    goAfterRegister();
  } catch (err) {
    const status = err?.response?.status;
    // 409 = 이 (userId, deviceId)에 이미 PIN 등록됨(서버 진실) → 캐시만 맞추고 통과
    if (status === 409) {
      if (userId != null) markPinRegistered(userId);
      toast.success('이미 설정된 PIN이 있어요');
      goAfterRegister();
      return;
    }
    // 400 = 형식 오류 → 인라인 안내, 그 외 → 토스트
    if (status === 400) {
      resetToEnter(err?.message || 'PIN 설정에 실패했어요. 다시 시도해주세요.');
    } else {
      resetToEnter();
      showError(err, 'PIN 설정에 실패했어요. 다시 시도해주세요.');
    }
  } finally {
    submitting.value = false;
  }
}

function goAfterRegister() {
  const redirect = route.query.redirect;
  router.replace(typeof redirect === 'string' ? redirect : '/workation');
}

// user_device.device_name 표시용 라벨 (BE VARCHAR(100) 이내)
function buildDeviceName() {
  const ua = navigator.userAgent || '';
  let os = '기기';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Macintosh|Mac OS/i.test(ua)) os = 'Mac';
  let browser = '브라우저';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  return `${browser} · ${os}`.slice(0, 100);
}
</script>

<template>
  <div
    class="flex flex-col items-center w-full min-h-screen px-5 pt-16 pb-8 bg-white"
  >
    <PinKeypad
      v-model="pin"
      :title="title"
      :description="description"
      :error="error"
      :disabled="submitting"
      @complete="handleComplete"
    />
  </div>
</template>
