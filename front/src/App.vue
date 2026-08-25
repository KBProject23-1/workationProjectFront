<template>
  <!--
    바깥 면은 앱 화면(bg-canvas)보다 확실히 어두워야 한다.
    같은 회색 계열로 두면 데스크톱에서 앱 영역의 경계가 사라진다
  -->
  <div class="min-h-screen w-full bg-[#dfe4ec]">
    <div
      class="mx-auto min-h-screen max-w-[430px] bg-white shadow-[0_0_0_1px_rgba(11,49,85,0.06),0_8px_40px_rgba(11,49,85,0.10)]"
    >
      <RouterView />
    </div>
    <Toaster position="top-center" rich-colors :duration="2000" />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import { Toaster } from '@/components/ui/sonner';
</script>

<style></style>
