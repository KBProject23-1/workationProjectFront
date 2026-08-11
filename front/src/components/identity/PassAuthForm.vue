<script setup>
// PASS 팝업 2 — 이름/휴대폰 번호/보안문자 입력 (PASS2 왼쪽 화면)
// - 개발용 Mock 이므로 보안문자도 화면에 표시된 값을 그대로 입력하면 통과한다.
// - '확인' 클릭 시 보안문자 일치를 프론트에서 확인한 뒤 상위(컴포저블)로 검증 요청을 보낸다.
// - 인증 성공 여부는 백엔드가 결정한다 (이 컴포넌트는 입력/UX 만 담당).
import { computed, onMounted, ref } from 'vue';
import { RefreshCw, User, Phone, ShieldQuestion, Volume2, X } from '@lucide/vue';
import PassLogo from './PassLogo.vue';

const props = defineProps({
  form: { type: Object, required: true },
  errorMessage: { type: String, default: '' },
});

const emit = defineEmits(['update:form', 'submit', 'back']);

const captcha = ref(''); // 표시용 보안문자 (6자리)
const captchaInput = ref('');
const captchaError = ref('');
const fieldErrors = ref({ name: '', phoneNumber: '' });

// 이름/휴대폰/보안문자 모두 입력해야 확인 버튼 활성화 (PASS2 레퍼런스와 동일)
const canSubmit = computed(
  () =>
    props.form.name.trim() &&
    /^01\d{9}$/.test(props.form.phoneNumber) &&
    captchaInput.value.length === 6,
);

function generateCaptcha() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += Math.floor(Math.random() * 10);
  }
  captcha.value = code;
  captchaInput.value = '';
  captchaError.value = '';
}

// 010-0000-0000 형식 표시용 — 저장(form.phoneNumber)은 하이픈 없는 11자리 숫자로 유지한다
// (백엔드/Mock 검증은 하이픈 없는 숫자 기준 — /^01\d{9}$/)
function formatPhone(digits) {
  const d = (digits || '').replace(/\D/g, '');
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
}

function handlePhoneInput(value) {
  emit('update:form', { ...props.form, phoneNumber: value.replace(/\D/g, '').slice(0, 11) });
}

function handleCaptchaInput(value) {
  captchaInput.value = value.replace(/\D/g, '').slice(0, 6);
  if (captchaError.value) captchaError.value = '';
}

function validate() {
  const errors = { name: '', phoneNumber: '' };
  if (!props.form.name.trim()) {
    errors.name = '이름을 입력해 주세요.';
  }
  if (!/^01\d{9}$/.test(props.form.phoneNumber)) {
    errors.phoneNumber = '휴대폰 번호 11자리를 입력해 주세요.';
  }
  fieldErrors.value = errors;

  if (captchaInput.value !== captcha.value) {
    captchaError.value = '보안문자가 일치하지 않습니다.';
    generateCaptcha();
    return false;
  }
  return !errors.name && !errors.phoneNumber;
}

function handleSubmit() {
  if (!validate()) return;
  emit('submit', {
    name: props.form.name.trim(),
    phoneNumber: props.form.phoneNumber,
  });
}

onMounted(generateCaptcha);
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <!-- 팝업 헤더: PASS 로고 -->
    <div class="shrink-0 border-b border-[#F0F4F9] px-6 py-4">
      <PassLogo />
    </div>

    <main class="flex-1 min-h-0 overflow-y-auto px-6 py-5">
      <!-- 백엔드 검증 실패 안내 -->
      <div
        v-if="errorMessage"
        class="mb-4 rounded-[14px] border border-red-100 bg-red-50 px-4 py-3"
      >
        <p class="text-[12.5px] font-semibold leading-relaxed text-red-600">{{ errorMessage }}</p>
      </div>

      <!-- 이름 -->
      <div>
        <label for="pass-name" class="mb-2 block text-[13px] font-bold text-[#191F28]">이름</label>
        <div class="relative">
          <input
            id="pass-name"
            :value="props.form.name"
            type="text"
            inputmode="text"
            placeholder="성명입력"
            class="h-[48px] w-full rounded-[14px] border-2 px-4 text-[14px] font-medium text-[#191F28] placeholder:text-[#B9C5D2] transition-colors focus:border-[#2878F0] focus:outline-none"
            :class="fieldErrors.name ? 'border-red-300' : 'border-[#DFE7F0]'"
            @input="emit('update:form', { ...props.form, name: $event.target.value })"
          />
          <User
            :size="17"
            class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#B9C5D2]"
          />
        </div>
        <p v-if="fieldErrors.name" class="mt-1.5 text-[12px] font-medium text-red-500">
          {{ fieldErrors.name }}
        </p>
      </div>

      <!-- 휴대폰 번호 -->
      <div class="mt-5">
        <label for="pass-phone" class="mb-2 block text-[13px] font-bold text-[#191F28]"
          >휴대폰번호</label
        >
        <div class="relative">
          <input
            id="pass-phone"
            :value="formatPhone(props.form.phoneNumber)"
            type="tel"
            inputmode="numeric"
            placeholder="010-0000-0000"
            maxlength="13"
            class="h-[48px] w-full rounded-[14px] border-2 px-4 text-[14px] font-medium tracking-wide text-[#191F28] placeholder:text-[#B9C5D2] transition-colors focus:border-[#2878F0] focus:outline-none"
            :class="fieldErrors.phoneNumber ? 'border-red-300' : 'border-[#DFE7F0]'"
            @input="handlePhoneInput($event.target.value)"
            @keyup.enter="handleSubmit"
          />
          <Phone
            :size="17"
            class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#B9C5D2]"
          />
        </div>
        <p v-if="fieldErrors.phoneNumber" class="mt-1.5 text-[12px] font-medium text-red-500">
          {{ fieldErrors.phoneNumber }}
        </p>
      </div>

      <!-- 보안문자 입력 -->
      <div class="mt-5">
        <label for="pass-captcha" class="mb-2 block text-[13px] font-bold text-[#191F28]"
          >보안문자 입력</label
        >
        <div class="flex gap-2.5">
          <!-- 보안문자 표시 -->
          <div
            class="flex h-[48px] items-center justify-center gap-[2px] rounded-[14px] border-2 border-[#DFE7F0] bg-[#F5F8FC] px-3"
          >
            <span
              v-for="(digit, index) in captcha.split('')"
              :key="index"
              class="inline-block text-[18px] font-extrabold tracking-wider text-[#3D4A5C] line-through decoration-[1.5px]"
              :style="{ transform: `rotate(${(index % 2 === 0 ? -1 : 1) * (4 + (index % 3))}deg)` }"
            >
              {{ digit }}
            </span>
            <button
              type="button"
              aria-label="보안문자 다시 생성"
              class="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-[#98A8B8] transition-colors hover:bg-[#EDF2F7] hover:text-[#3D4A5C] active:scale-90"
              @click="generateCaptcha"
            >
              <RefreshCw :size="15" :stroke-width="2.5" />
            </button>
            <span
              aria-hidden="true"
              class="flex h-8 w-8 items-center justify-center text-[#98A8B8]"
            >
              <Volume2 :size="15" :stroke-width="2.5" />
            </span>
          </div>

          <!-- 보안문자 입력 -->
          <div class="relative min-w-0 flex-1">
            <input
              id="pass-captcha"
              :value="captchaInput"
              type="text"
              inputmode="numeric"
              placeholder="보안문자 입력"
              maxlength="6"
              class="h-[48px] w-full rounded-[14px] border-2 px-4 pr-9 text-[14px] font-medium tracking-widest text-[#191F28] placeholder:text-[#B9C5D2] transition-colors focus:border-[#2878F0] focus:outline-none"
              :class="captchaError ? 'border-red-300' : 'border-[#DFE7F0]'"
              @input="handleCaptchaInput($event.target.value)"
              @keyup.enter="handleSubmit"
            />
            <button
              v-if="captchaInput"
              type="button"
              aria-label="입력 지우기"
              class="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#EDF2F7] text-[#7186A0] transition-colors hover:text-[#3D4A5C] active:scale-90"
              @click="captchaInput = ''"
            >
              <X :size="14" :stroke-width="2.5" />
            </button>
          </div>
        </div>
        <p v-if="captchaError" class="mt-1.5 text-[12px] font-medium text-red-500">
          {{ captchaError }}
        </p>
      </div>

      <p class="mt-5 flex items-start gap-1.5 text-[11.5px] font-medium leading-relaxed text-[#98A8B8]">
        <ShieldQuestion :size="14" class="mt-0.5 shrink-0" />
        테스트용 Mock 인증입니다. 화면에 표시된 보안문자를 그대로 입력해 주세요.
      </p>
    </main>

    <!-- 하단: 취소 / 확인 -->
    <footer class="shrink-0 px-6 pt-3 pb-[max(env(safe-area-inset-bottom),20px)]">
      <div class="flex gap-3">
        <button
          type="button"
          class="h-[52px] flex-1 rounded-full bg-[#E8EDF3] text-[15px] font-bold text-[#4A5568] transition-all duration-150 hover:bg-[#DCE3EB] active:scale-[0.98]"
          @click="emit('back')"
        >
          취소
        </button>
        <button
          type="button"
          class="h-[52px] flex-1 rounded-full text-[15px] font-bold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
          :class="canSubmit ? 'bg-[#23272F] hover:brightness-110' : 'bg-[#98A8B8]'"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          확인
        </button>
      </div>
    </footer>
  </div>
</template>
