<script setup>
const props = defineProps({
  modelValue: { type: String, default: null },
  readonly: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const atmosphereTags = [
  { value: 'QUIET', label: '조용한' },
  { value: 'OPEN', label: '자유로운' },
  { value: 'COLLAB', label: '협업하는' },
];

function selectTag(value) {
  if (!props.readonly) emit('update:modelValue', value);
}
</script>

<template>
  <div class="atmosphere-tags" :class="{ readonly }" role="group" aria-label="분위기 태그">
    <button
      v-for="tag in atmosphereTags"
      v-show="!readonly || modelValue === tag.value"
      :key="tag.value"
      type="button"
      class="atmosphere-tag"
      :class="{ active: modelValue === tag.value }"
      :aria-pressed="modelValue === tag.value"
      :disabled="readonly"
      @click="selectTag(tag.value)"
    >
      {{ tag.label }}
    </button>
  </div>
</template>

<style scoped>
.atmosphere-tags { display:flex; flex-wrap:wrap; gap:6px; }
.atmosphere-tag { min-height:27px; padding:4px 9px; color:#68798f; border:1px solid #cbd7e5; border-radius:14px; background:#fff; font-family:inherit; font-size:12px; font-weight:400; line-height:1.2; cursor:pointer; transition:color .15s,border-color .15s,background .15s; }
.atmosphere-tag.active { color:#fff; border-color:#3087ed; background:#3087ed; }
.atmosphere-tag:focus-visible { outline:2px solid #87baf7; outline-offset:2px; }
.readonly .atmosphere-tag,
.readonly .atmosphere-tag.active { color:#52647b; border-color:#d5e1ef; background:#f6f8fb; cursor:default; }
</style>
