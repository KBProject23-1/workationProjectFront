<script setup>
// 프로필 수정 화면 — /account/me/edit
// - 로그인 사용자의 닉네임/소속 회사명을 확인·수정하는 화면 (Figma: 내 프로필 편집 — 참고용)
// - 진입 시 GET /users/me (authStore.fetchMyInfo 재사용) 로 최신 사용자 정보를 조회해 표시한다.
// - 저장은 PATCH /users/me (기존 프로필 수정 API) — 변경된 필드만 보낸다 (부분 수정).
// - 닉네임/소속 회사 입력칸은 처음에는 변경 불가(disabled) 상태로 보여주고, 각 칸 옆 '수정하기'
//   버튼을 누르면 해당 칸만 입력 가능 상태로 전환된다.
// - 소속 회사: 기존 회사명을 지운 채 확인을 누르면 companyName: null 로 전송해 NULL(삭제)로 저장한다.
// - 수정 성공: authStore.user 에 최신 정보 반영 → 완료 토스트 → 내정보 화면(/account/me) 이동.
// - 이름/휴대폰 번호/이메일은 이 화면에서 수정하지 않는다 (추후 별도 페이지 — PATCH API 도 수정 불가 필드).
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { toast } from 'vue-sonner';
import { useAuthStore } from '@/stores/authStore';
import { useErrorToast } from '@/composables/useErrorToast';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';

const router = useRouter();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { showError } = useErrorToast();

const loading = ref(true);
const nickname = ref('');
const companyName = ref('');
const errors = ref({ nickname: '', companyName: '' });
const isSaving = ref(false);

// 수정 잠금 상태 — 화면 입장 시에는 변경 불가, '수정하기' 버튼을 눌러야 해당 칸만 편집 가능해진다
const isNicknameEditable = ref(false);
const isCompanyEditable = ref(false);

// 조회 직후 원래 값 — 변경 여부 판단(불필요한 PATCH 방지)에 사용
const originalNickname = ref('');
const originalCompanyName = ref('');

// 백엔드 검증 기준과 동일 (knowledgeFront.md Form Validation / UserServiceImpl)
// - nickname: 필수 + trim 후 VARCHAR(50)
// - companyName: 선택 + trim 후 VARCHAR(100)
const NICKNAME_MAX_LENGTH = 50;
const COMPANY_NAME_MAX_LENGTH = 100;

function validateNickname(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) return '닉네임을 입력해 주세요.';
  if (trimmed.length > NICKNAME_MAX_LENGTH) {
    return `닉네임은 ${NICKNAME_MAX_LENGTH}자 이내로 입력해 주세요.`;
  }
  return '';
}

function validateCompanyName(value) {
  const trimmed = (value || '').trim();
  if (trimmed.length > COMPANY_NAME_MAX_LENGTH) {
    return `회사명은 ${COMPANY_NAME_MAX_LENGTH}자 이내로 입력해 주세요.`;
  }
  return '';
}

// 아바타 — 이름 첫 글자 (비어 있으면 워케이너 첫 글자) — 내정보 화면과 동일한 프로필 사진
const avatarInitial = computed(
  () => user.value?.name?.trim()?.charAt(0) || '워',
);

// 입력값이 유효하고, 실제 변경사항이 있고, 저장 중이 아닐 때만 저장 가능
const canSave = computed(() => {
  if (isSaving.value) return false;
  if (errors.value.nickname || errors.value.companyName) return false;
  return hasChanges.value;
});

// PATCH 부분 수정 — 변경된 필드만 전송 대상으로 본다.
// - 회사명을 비운 값(빈 문자열)도 변경으로 본다: 기존 회사명을 지우면 companyName: null 을 보내
//   백엔드가 company_name 을 NULL 로 저장한다 (소속 회사 삭제 — knowledgeFront.md Form Validation).
// - 닉네임은 필수라 빈 값 불가 (validateNickname 이 막는다).
const hasChanges = computed(() => {
  const nextNickname = nickname.value.trim();
  const nextCompanyName = companyName.value.trim();
  const hasNicknameChange = nextNickname !== originalNickname.value;
  const hasCompanyChange = nextCompanyName !== originalCompanyName.value;
  return hasNicknameChange || hasCompanyChange;
});

// '수정하기' 버튼 — 해당 칸만 편집 가능 상태로 전환한다 (에러 초기화 포함)
function enableNicknameEdit() {
  isNicknameEditable.value = true;
  errors.value.nickname = '';
}

function enableCompanyEdit() {
  isCompanyEditable.value = true;
  errors.value.companyName = '';
}

function goBack() {
  router.back();
}

async function handleSave() {
  // 이중 방어 — 버튼이 비활성화되어 있어도 유효하지 않으면 저장하지 않는다
  const nicknameError = validateNickname(nickname.value);
  const companyError = validateCompanyName(companyName.value);
  errors.value = { nickname: nicknameError, companyName: companyError };
  if (nicknameError || companyError) return;

  // PATCH 부분 수정 — 변경된 필드만 전송 (변경사항이 없으면 요청 자체를 보내지 않는다)
  // - 회사명 삭제(빈 값)는 companyName: null 로 전송 → 백엔드가 company_name 을 NULL 로 저장
  const payload = {};
  const nextNickname = nickname.value.trim();
  const nextCompanyName = companyName.value.trim();
  if (nextNickname !== originalNickname.value) payload.nickname = nextNickname;
  if (nextCompanyName !== originalCompanyName.value) {
    payload.companyName = nextCompanyName.length > 0 ? nextCompanyName : null;
  }
  if (Object.keys(payload).length === 0) return;

  isSaving.value = true;
  try {
    await authStore.updateProfile(payload);
    toast.success('프로필이 수정되었어요.');
    // 내정보 화면으로 이동 — authStore.user 에 최신 정보가 반영되어 있어 그대로 표시된다
    router.replace('/account/me');
  } catch (err) {
    // 서버 메시지(닉네임 중복 등)는 err.message 로 토스트에 표시된다 (인터셉터가 치환)
    showError(err, '프로필 수정에 실패했어요. 다시 시도해 주세요.');
  } finally {
    isSaving.value = false;
  }
}

onMounted(async () => {
  try {
    await authStore.fetchMyInfo();
  } catch (err) {
    showError(err, '내 정보를 불러오지 못했어요.');
  } finally {
    // 조회 실패 시에도 store 에 남아 있는 기존 값으로 폼을 채워 재시도할 수 있게 한다
    const current = authStore.user || {};
    originalNickname.value = (current.nickname ?? '').trim();
    originalCompanyName.value = (current.companyName ?? '').trim();
    nickname.value = originalNickname.value;
    companyName.value = originalCompanyName.value;
    loading.value = false;
  }
});
</script>

<template>
  <main class="flex min-h-screen flex-col bg-canvas px-5 pt-4 pb-8">
    <LoadingScreen
      v-if="loading"
      title="프로필을 불러오고 있어요"
      description="잠시만 기다려 주세요"
    />

    <template v-else>
      <!-- 헤더 -->
      <div class="mb-6">
        <BaseHeader
          title="프로필 수정"
          @back="goBack"
        />
      </div>

      <!-- 프로필 사진 — 기존 내정보 화면과 동일한 아바타 -->
      <div class="flex justify-center">
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-brand-weak text-[26px] font-bold text-brand"
        >
          {{ avatarInitial }}
        </div>
      </div>

      <!-- 닉네임 / 소속 회사 입력 -->
      <!-- 입력칸은 화면 입장 시 변경 불가(disabled) 상태 — 각 칸 옆 '수정하기' 버튼을 눌러야 편집 가능 -->
      <div class="mt-8 space-y-6">
        <div>
          <div class="mb-2 flex items-center justify-between">
            <label
              for="edit-nickname"
              class="block text-body-sm font-bold text-ink"
            >
              닉네임
            </label>
            <button
              v-if="!isNicknameEditable"
              type="button"
              class="rounded-full border border-brand px-3 py-1 text-body-sm font-semibold text-brand transition-colors active:bg-brand-weak"
              @click="enableNicknameEdit"
            >
              수정하기
            </button>
          </div>
          <BaseInput
            id="edit-nickname"
            v-model="nickname"
            inputmode="text"
            maxlength="50"
            placeholder="닉네임을 입력해 주세요"
            :disabled="!isNicknameEditable"
            :has-error="!!errors.nickname"
            :error-message="errors.nickname"
            class="h-12 rounded-card border-line bg-canvas px-4 text-body font-medium text-ink placeholder:text-ink-mute disabled:cursor-not-allowed"
            @update:model-value="errors.nickname = ''"
            @blur="errors.nickname = validateNickname(nickname)"
          />
        </div>

        <div>
          <div class="mb-2 flex items-center justify-between">
            <label
              for="edit-company-name"
              class="block text-body-sm font-bold text-ink"
            >
              소속 회사
            </label>
            <button
              v-if="!isCompanyEditable"
              type="button"
              class="rounded-full border border-brand px-3 py-1 text-body-sm font-semibold text-brand transition-colors active:bg-brand-weak"
              @click="enableCompanyEdit"
            >
              수정하기
            </button>
          </div>
          <BaseInput
            id="edit-company-name"
            v-model="companyName"
            inputmode="text"
            maxlength="100"
            placeholder="회사명을 입력해 주세요"
            :disabled="!isCompanyEditable"
            :has-error="!!errors.companyName"
            :error-message="errors.companyName"
            class="h-12 rounded-card border-line bg-canvas px-4 text-body font-medium text-ink placeholder:text-ink-mute disabled:cursor-not-allowed"
            @update:model-value="errors.companyName = ''"
            @blur="errors.companyName = validateCompanyName(companyName)"
          />
        </div>
      </div>

      <div class="flex-1" />

      <!-- 확인 버튼 — 변경사항이 없거나 입력값이 유효하지 않으면 비활성화 -->
      <div class="pt-8 text-center">
        <BaseButton
          :disabled="!canSave"
          class="w-full"
          @click="handleSave"
        >
          {{ isSaving ? '저장 중...' : '확인' }}
        </BaseButton>
      </div>
    </template>
  </main>
</template>
