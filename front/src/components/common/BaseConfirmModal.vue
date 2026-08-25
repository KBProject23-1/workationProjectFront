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

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  cancelLabel: { type: String, default: '취소' },
  confirmLabel: { type: String, default: '확인' },
  // 취소 없이 확인만 받는 안내용 모달에서 쓴다
  hideCancel: { type: Boolean, default: false },
  contentClass: { type: String, default: 'max-w-sm' },
  headerClass: { type: String, default: '' },
});

const emit = defineEmits(['confirm', 'cancel']);

function handleOpenChange(open) {
  if (!open && !props.loading) emit('cancel');
}
</script>

<template>
  <Dialog :open="visible" @update:open="handleOpenChange">
    <DialogContent
      :show-close-button="false"
      :class="contentClass"
    >
      <DialogHeader :class="['text-center', headerClass]">
        <DialogTitle class="whitespace-pre-line">{{ title }}</DialogTitle>
        <DialogDescription class="whitespace-pre-line">{{ message }}</DialogDescription>
      </DialogHeader>
      <slot />
      <DialogFooter class="flex-row gap-2 sm:justify-center">
        <Button
          v-if="!hideCancel"
          type="button"
          variant="outline"
          class="flex-1"
          :disabled="loading"
          @click="$emit('cancel')"
        >
          {{ cancelLabel }}
        </Button>
        <Button
          type="button"
          class="flex-1"
          :disabled="loading"
          @click="$emit('confirm')"
        >
          {{ confirmLabel }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
