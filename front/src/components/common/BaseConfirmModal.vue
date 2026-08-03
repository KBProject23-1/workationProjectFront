<script setup>
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
});

const emit = defineEmits(['confirm', 'cancel']);

function handleOpenChange(open) {
  if (!open) emit('cancel');
}
</script>

<template>
  <Dialog :open="visible" @update:open="handleOpenChange">
    <DialogContent :show-close-button="false" class="max-w-sm">
      <DialogHeader class="text-center">
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ message }}</DialogDescription>
      </DialogHeader>
      <DialogFooter class="flex-row gap-2 sm:justify-center">
        <Button
          type="button"
          variant="outline"
          class="flex-1"
          @click="$emit('cancel')"
        >
          취소
        </Button>
        <Button type="button" class="flex-1" @click="$emit('confirm')">
          확인
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
