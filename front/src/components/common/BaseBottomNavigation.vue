<script setup>
import { useRouter } from 'vue-router';
import { Clock, Sparkles, Home, Calendar, User } from '@lucide/vue';

const router = useRouter();

const tabs = [
  {
    key: 'reservation',
    label: '예약',
    icon: Clock,
    path: null,
    disabled: true,
  },
  {
    key: 'recommend',
    label: '추천',
    icon: Sparkles,
    path: null,
    disabled: true,
  },
  { key: 'home', label: '홈', icon: Home, path: '/wallet', disabled: false },
  {
    key: 'workation',
    label: '워케이션',
    icon: Calendar,
    path: '/workation',
    disabled: false,
  },
  { key: 'myinfo', label: '내정보', icon: User, path: null, disabled: true },
];

function handleClick(tab) {
  if (tab.disabled) return;
  router.push(tab.path);
}
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 w-full max-w-[430px] mx-auto bg-white border-t border-gray-100 flex items-center justify-around py-2 pb-safe"
  >
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      class="flex flex-col items-center justify-center relative transition-transform active:scale-95"
      :class="[
        tab.disabled ? 'text-gray-300' : 'text-[#1E4268]',
        tab.key === 'home' ? 'px-2' : 'py-1 px-3',
      ]"
      :disabled="tab.disabled"
      @click="handleClick(tab)"
    >
      <!-- 홈 버튼 전용: 돌출된 원형 배경 및 파란색 그림자 효과 -->
      <template v-if="tab.key === 'home'">
        <div
          class="-mt-8 mb-1 flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-[0_4px_16px_rgba(59,130,246,0.3)] border border-blue-50"
        >
          <component :is="tab.icon" :size="26" class="text-[#1E4268]" />
        </div>
        <span class="text-[11px] font-medium text-[#1E4268]">{{
          tab.label
        }}</span>
      </template>

      <!-- 일반 버튼 -->
      <template v-else>
        <component :is="tab.icon" :size="22" />
        <span class="text-[11px] mt-1">{{ tab.label }}</span>
      </template>
    </button>
  </nav>
</template>
