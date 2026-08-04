<template>
  <div class="w-full min-h-screen bg-white">
    <RouterView />
    <Toaster position="top-center" rich-colors />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import { Toaster } from '@/components/ui/sonner';
</script>

<style></style>
