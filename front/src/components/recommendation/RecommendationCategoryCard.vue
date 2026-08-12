<script setup>
defineProps({
  category: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['select']);
</script>

<template>
  <button
    type="button"
    class="category-card"
    :class="{ selected }"
    :style="{
      '--category-color': category.color,
      '--category-background': category.background,
      '--category-border': category.border,
    }"
    :aria-pressed="selected"
    @click="$emit('select', category.key)"
  >
    <component :is="category.icon" :size="34" stroke-width="1.8" />
    <strong>{{ category.title }}</strong>
    <span>상위 추천 보기</span>
    <!-- <i>
      <Check v-if="selected" :size="13" stroke-width="3" />
      <ChevronRight v-else :size="14" stroke-width="1.8" />
    </i> -->
  </button>
</template>

<style scoped>
.category-card {
  display: flex;
  min-height: 176px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--category-border);
  border-radius: 15px;
  background: var(--category-background);
  color: var(--category-color);
  box-shadow: none;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease;
}

.category-card:active {
  transform: scale(0.98);
}

.category-card.selected {
  box-shadow: 0 0 0 2px var(--category-color);
}

.category-card strong {
  margin-top: 12px;
  font-size: 22px;
  font-style: normal;
  font-weight: 700;
}

.category-card span {
  margin-top: 6px;
  color: #7b8494;
  font-size: 12px;
}

.category-card i {
  display: flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  margin-top: 14px;
  border: 1.5px solid currentcolor;
  border-radius: 50%;
  background: #ffffff;
  font-style: normal;
}
</style>
