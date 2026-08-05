<template>
  <div class="w-full min-h-screen bg-gray-100">
    <div class="max-w-[430px] mx-auto min-h-screen bg-white">
      <RouterView />
    </div>
    <Toaster position="top-center" rich-colors />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import { Toaster } from '@/components/ui/sonner';
</script>

<style></style>
