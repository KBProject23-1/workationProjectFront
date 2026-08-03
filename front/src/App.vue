<template>
  <div class="w-full min-h-screen bg-white">
    <router-view />
    <Toaster position="top-center" rich-colors />
  </div>
</template>

<script setup>
import { Toaster } from '@/components/ui/sonner';
</script>

<style></style>
