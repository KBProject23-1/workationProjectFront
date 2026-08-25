<script setup>
defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
});

defineEmits(['change']);
</script>

<template>
  <nav class="review-pagination" aria-label="리뷰 페이지 이동">
    <button
      type="button"
      :disabled="page === 1"
      @click="$emit('change', page - 1)"
    >
      이전
    </button>
    <span>{{ page }} / {{ totalPages }}</span>
    <button
      type="button"
      :disabled="page === totalPages"
      @click="$emit('change', page + 1)"
    >
      다음
    </button>
  </nav>
</template>

<style scoped>
.review-pagination { width:100%; display:grid; grid-template-columns:98px 1fr 98px; align-items:center; gap:12px; margin-top:18px; }
.review-pagination button { width:98px; height:32px; padding:0; color:#3087ed; border:1.5px solid #3087ed; border-radius:20px; background:#fff; font-size:12px; cursor:pointer; }
.review-pagination button:disabled { color:#aab8ca; border-color:#cbd7e5; cursor:default; }
.review-pagination span { color:#172033; text-align:center; font-size:12px; white-space:nowrap; }
</style>
