<script setup>
import { Check } from '@lucide/vue';

defineProps({
  icon: { type: [Object, Function], required: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  isSelected: { type: Boolean, default: false },
  // 'square' = 다중 선택(체크박스 느낌), 'circle' = 단일 선택(라디오 느낌)
  indicatorShape: { type: String, default: 'square' },
  monoSubtitle: { type: Boolean, default: false },
});

defineEmits(['select']);
</script>

<template>
  <button
    type="button"
    class="flex items-center justify-between w-full p-4 rounded-sheet border transition-all duration-200 active:scale-[0.99] text-left"
    :class="
      isSelected
        ? 'border-brand bg-brand-weak/40 shadow-xs ring-1 ring-blue-600/20'
        : 'border-line bg-canvas/50 hover:bg-canvas hover:border-line'
    "
    @click="$emit('select')"
  >
    <div class="flex items-center gap-3.5 min-w-0">
      <div
        class="w-10 h-10 rounded-card flex items-center justify-center shrink-0 border transition-colors"
        :class="
          isSelected
            ? 'bg-brand text-white border-brand shadow-xs'
            : 'bg-white text-ink-sub border-line'
        "
      >
        <component :is="icon" :size="18" />
      </div>

      <div class="min-w-0">
        <p class="text-body font-bold text-ink truncate">
          {{ title }}
        </p>
        <p
          class="text-body-sm font-medium text-ink-mute truncate mt-0.5"
          :class="monoSubtitle ? 'font-mono' : ''"
        >
          {{ subtitle }}
        </p>
      </div>
    </div>

    <div
      class="w-6 h-6 shrink-0 flex items-center justify-center transition-all duration-200"
      :class="[
        indicatorShape === 'circle' ? 'rounded-full' : 'rounded-chip',
        isSelected
          ? 'bg-brand text-white scale-100'
          : 'border-2 border-line bg-white scale-95',
      ]"
    >
      <Check v-if="isSelected" :size="14" :stroke-width="3" />
    </div>
  </button>
</template>
