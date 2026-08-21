<script setup>
// 회원 탈퇴 화면 — /account/me/withdraw
// - 흐름: 탈퇴 안내 확인 → 현재 비밀번호 입력 → 최종 확인(모달) → DELETE /users/me 호출 → 성공 시 로그인 화면 이동
// - API: DELETE /api/v1/users/me — 현재 비밀번호(password) 재확인으로 본인 인증 (민감 작업 추가 인증)
//   성공 시 백엔드가 accessToken/refreshToken Cookie 를 즉시 만료 처리한다.
// - 탈퇴 후 복구 불가/보관 정보 안내 문구는 백엔드 동작(knowledge.md Withdrawal Policy)과
//   요청된 법정 보관 기간을 기준으로 작성한다 (존재하지 않는 정책을 단정하지 않는다).
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import {
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
} from '@lucide/vue';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { setPinRegistered } from '@/utils/pinRegistry';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();
const authStore = useAuthStore();
const walletStore = useWalletStore();
const { showError } = useErrorToast();

// 주의사항 확인 체크 여부 — 확인하지 않으면 탈퇴 버튼 비활성화
const isNoticeChecked = ref(false);
// 현재 비밀번호 — 본인 인증용 (민감 작업 추가 인증 — Request Body 로만 전달)
const password = ref('');
const isPasswordVisible = ref(false);
// 최종 탈퇴 확인 모달 표시 여부
const isConfirmOpen = ref(false);
// 탈퇴 API 요청 중 — 중복 클릭/중복 요청 방지
const isWithdrawing = ref(false);

// 법령에 따라 일정 기간 보관되는 정보 (탈퇴 후에도 유지될 수 있는 데이터)
const retentionItems = [
  { label: '서비스 제공을 위해 수집한 개인 정보', period: '30일' },
  { label: '대금결제 및 재화 등의 공급에 관한 기록', period: '5년' },
  { label: '계약 또는 청약철회 등에 관한 기록', period: '5년' },
  { label: '전자금융거래에 관한 기록', period: '5년' },
  { label: '소비자의 불만 또는 분쟁처리에 관한 기록', period: '3년' },
  { label: '웹사이트 방문 기록', period: '3개월' },
];

// 현재 지갑 잔액 — 잔액이 0원 초과면 탈퇴 진행 불가 (백엔드 WALLET_BALANCE_REMAINING 정책과 동일)
const hasRemainingBalance = computed(() => walletStore.balance > 0);
// 잔액 조회 중(초기 0원 깜빡임 방지)이거나 잔액이 남아 있으면 동의 체크 비활성
const isBalanceBlocked = computed(
  () => walletStore.isLoading || hasRemainingBalance.value,
);
const formattedBalance = computed(() =>
  walletStore.balance.toLocaleString('ko-KR'),
);

// 탈퇴 버튼 활성화 조건 — 주의사항 확인 + 비밀번호 입력 + 요청 중이 아닐 때 + 잔액이 없을 때 (중복 클릭 방지)
const canWithdraw = computed(
  () =>
    isNoticeChecked.value &&
    !!password.value &&
    !isWithdrawing.value &&
    !hasRemainingBalance.value,
);

onMounted(() => {
  // 탈퇴 화면 진입 시 현재 지갑 잔액 조회 — 기존 GET /wallets/me 재사용 (신규 API 불필요)
  walletStore.fetchWallet();
});

function goBack() {
  router.back();
}

// 탈퇴 버튼/비밀번호 Enter — 활성화 조건 충족 시에만 최종 확인 모달을 연다 (이중 방어)
function openConfirm() {
  if (canWithdraw.value) isConfirmOpen.value = true;
}

// 최종 확인 모달에서 '탈퇴하기' 클릭 → API 호출
async function handleWithdraw() {
  if (isWithdrawing.value) return;
  isWithdrawing.value = true;
  try {
    // Page → Store → API Module → axiosInstance → Backend 구조 (페이지에서 axios 직접 호출 금지)
    await authStore.withdraw(password.value);
    // 성공 — 백엔드가 Cookie 를 만료시켰고 authStore 인메모리 상태도 정리됐다.
    // 이 기기 PIN 등록 캐시도 초기화한다 (탈퇴한 계정의 기기 인증 정보 잔존 방지)
    setPinRegistered(false);
    isConfirmOpen.value = false;
    password.value = ''; // 비밀번호 원문을 메모리에 남기지 않는다
    toast.success('회원탈퇴가 정상적으로 처리되었어요.');
    // 로그인 화면으로 이동 (replace — 뒤로 가기로 탈퇴 화면 복귀 방지)
    router.replace('/login');
  } catch (err) {
    // 서버 메시지(비밀번호 불일치/잔액 잔존/이미 탈퇴 등)는 err.message 로 토스트에 표시된다 (인터셉터가 치환)
    showError(err, '회원탈퇴에 실패했어요. 다시 시도해 주세요.');
    isConfirmOpen.value = false;
  } finally {
    isWithdrawing.value = false;
  }
}
</script>

<template>
  <main class="flex min-h-screen flex-col bg-canvas px-5 pt-4 pb-8">
    <!-- 헤더 -->
    <div class="mb-6">
      <BaseHeader
        title="회원 탈퇴"
        @back="goBack"
      />
    </div>

    <!-- ① 탈퇴 경고 안내 -->
    <section class="rounded-card border border-danger bg-danger/10 p-4">
      <div class="flex items-center gap-1.5">
        <AlertTriangle :size="17" class="shrink-0 text-danger" />
        <p class="text-body font-bold text-danger">회원 탈퇴 안내</p>
      </div>
      <p class="mt-2 text-body-sm font-medium leading-relaxed text-danger/90">
        탈퇴하면 워킷 서비스 이용이 중단되고, 계정 정보는 삭제되어
        다시 복구할 수 없어요.
      </p>
    </section>

    <!-- ② 현재 지갑 잔액 — 0원이 아닐 때 탈퇴 불가 안내 + 동의 체크 비활성 -->
    <section
      class="mt-3 overflow-hidden rounded-card border border-line bg-white"
    >
      <div class="flex items-center justify-between px-5 py-4">
        <p class="text-body-sm font-medium text-ink-sub">현재 지갑 잔액</p>
        <p class="text-title font-bold text-ink">
          {{ walletStore.isLoading ? '—' : formattedBalance }}원
        </p>
      </div>
      <div
        v-if="hasRemainingBalance"
        class="border-t border-red-100 bg-danger/10 px-5 py-3.5"
      >
        <p class="text-body-sm font-medium leading-relaxed text-danger">
          잔액이 남아있어 회원 탈퇴를 진행할 수 없습니다.
          잔액을 모두 사용하거나 환불한 후 다시 시도해주세요.
        </p>
      </div>
    </section>

    <!-- ③ 탈퇴 시 처리되는 내용 -->
    <section class="mt-3">
      <div class="overflow-hidden rounded-card border border-line bg-white">
        <p class="px-5 pt-3.5 text-body-sm font-medium text-ink-mute">
          탈퇴 시 처리되는 내용
        </p>
        <ul class="mt-1 space-y-3 px-5 py-4">
          <li class="flex gap-2 text-body-sm font-medium leading-relaxed text-ink-sub">
            <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
            <span>
              모든 로그인 세션(다른 기기 포함)이 종료되고 로그인 Cookie가 만료돼요
            </span>
          </li>
          <li class="flex gap-2 text-body-sm font-medium leading-relaxed text-ink-sub">
            <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
            <span>
              계정 정보(이름·이메일·휴대폰 번호·프로필)는 삭제되고 복구할 수 없어요
            </span>
          </li>
          <li class="flex gap-2 text-body-sm font-medium leading-relaxed text-ink-sub">
            <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
            <span>
              탈퇴한 계정으로는 다시 로그인할 수 없어요
            </span>
          </li>
          <li class="flex gap-2 text-body-sm font-medium leading-relaxed text-ink-sub">
            <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
            <span>
              전자지갑에 잔액이 남아 있으면 탈퇴할 수 없어요 (잔액을 모두
              사용하거나 출금한 후 탈퇴할 수 있어요)
            </span>
          </li>
        </ul>
      </div>
    </section>

    <!-- ④ 법령에 따라 보관되는 정보 -->
    <section class="mt-3">
      <div class="overflow-hidden rounded-card border border-line bg-white">
        <p class="px-5 pt-3.5 text-body-sm font-medium text-ink-mute">
          법령에 따라 보관되는 정보
        </p>
        <p class="px-5 pt-2 text-body-sm font-medium leading-relaxed text-ink-sub">
          탈퇴 후에도 금융 거래·결제 내역 등은 관련 법령에 따라
          일정 기간 보관될 수 있어요.
        </p>
        <div class="mt-1 divide-y divide-line">
          <div
            v-for="item in retentionItems"
            :key="item.label"
            class="flex items-center justify-between gap-3 px-5 py-3"
          >
            <span class="text-body-sm font-medium leading-relaxed text-ink-sub">
              {{ item.label }}
            </span>
            <span class="shrink-0 text-body-sm font-semibold text-ink">
              {{ item.period }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ⑤ 주의사항 확인 체크박스 -->
    <button
      type="button"
      role="checkbox"
      :aria-checked="isNoticeChecked"
      :disabled="isBalanceBlocked"
      class="mt-5 flex w-full items-start gap-2.5 text-left"
      :class="isBalanceBlocked ? 'cursor-not-allowed opacity-50' : ''"
      @click="isNoticeChecked = !isNoticeChecked"
    >
      <span
        class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-chip border transition-colors"
        :class="
          isNoticeChecked
            ? 'border-brand bg-brand text-white'
            : 'border-line bg-white text-transparent'
        "
      >
        <Check :size="14" :stroke-width="3" />
      </span>
      <span class="text-body-sm font-medium leading-relaxed text-ink">
        위 안내를 모두 확인했으며, 탈퇴에 동의합니다.
      </span>
    </button>

    <!-- ⑥ 현재 비밀번호 입력 (본인 인증) -->
    <div class="mt-6">
      <label
        for="withdraw-password"
        class="mb-1 block text-body-sm font-bold text-ink"
      >
        현재 비밀번호
      </label>
      <p class="mb-2 text-body-sm font-medium text-ink-mute">
        본인 확인을 위해 현재 비밀번호를 입력해 주세요.
      </p>
      <div class="relative">
        <BaseInput
          id="withdraw-password"
          v-model="password"
          :type="isPasswordVisible ? 'text' : 'password'"
          inputmode="text"
          placeholder="현재 비밀번호를 입력해 주세요"
          autocomplete="current-password"
          class="h-12 rounded-card border-line bg-canvas px-4 pr-12 text-body font-medium text-ink placeholder:text-ink-mute"
          @keyup.enter="openConfirm"
        />
        <button
          type="button"
          class="absolute right-2 top-6 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-ink-mute transition-colors hover:bg-canvas hover:text-brand"
          :aria-label="isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'"
          :aria-pressed="isPasswordVisible"
          aria-controls="withdraw-password"
          @mousedown.prevent
          @click="isPasswordVisible = !isPasswordVisible"
        >
          <EyeOff v-if="isPasswordVisible" :size="19" />
          <Eye v-else :size="19" />
        </button>
      </div>
    </div>

    <div class="flex-1" />

    <!-- ⑦ 회원 탈퇴 버튼 — 위험 작업이므로 danger 스타일 (일반 버튼과 시각적으로 구분) -->
    <div class="pt-8 text-center">
      <BaseButton
        type="button"
        variant="destructive"
        :disabled="!canWithdraw"
        class="w-full"
        @click="openConfirm"
      >
        회원 탈퇴
      </BaseButton>
    </div>

    <!-- ⑧ 최종 탈퇴 확인 모달 — 명시적 확인 후에만 API 호출 -->
    <Dialog
      :open="isConfirmOpen"
      @update:open="
        (open) => {
          if (!open && !isWithdrawing) isConfirmOpen = false;
        }
      "
    >
      <DialogContent :show-close-button="false" class="max-w-sm">
        <DialogHeader class="text-center">
          <DialogTitle class="whitespace-pre-line">
            정말 탈퇴하시겠어요?
          </DialogTitle>
          <DialogDescription>
            탈퇴 후에는 계정 정보를 복구할 수 없고,
            모든 로그인 세션이 종료돼요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex-row gap-2 sm:justify-center">
          <BaseButton
            type="button"
            variant="outline"
            class="flex-1"
            :disabled="isWithdrawing"
            @click="isConfirmOpen = false"
          >
            취소
          </BaseButton>
          <BaseButton
            type="button"
            variant="destructive"
            class="flex-1"
            :disabled="isWithdrawing"
            @click="handleWithdraw"
          >
            {{ isWithdrawing ? '탈퇴 처리 중...' : '탈퇴하기' }}
          </BaseButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </main>
</template>
