<script setup>
defineProps({
  review: { type: Object, required: true },
});

function formatDate(value) {
  return value.slice(0, 10).replaceAll('-', '. ');
}
</script>

<template>
  <article class="review-card">
    <div class="review-image" aria-hidden="true">
      <div></div><span></span>
    </div>
    <div class="review-content">
      <div class="review-title">
        <strong>{{ review.nickname }}</strong>
        <span>★</span>
        <b>{{ review.rating.toFixed(1) }}</b>
      </div>
      <small>{{ formatDate(review.created_at) }}</small>
      <p>{{ review.content }}</p>
    </div>
  </article>
</template>

<style scoped>
.review-card { display:flex; gap:13px; min-height:86px; padding:11px 13px; border:1.5px solid #dbe3ee; border-radius:16px; background:#fff; }.review-image { position:relative; width:64px; height:58px; flex:none; border-radius:11px; background:#cbe1ff; }.review-image div { position:absolute; top:9px; left:10px; right:10px; height:20px; border-radius:5px; background:#f2f7ff; }.review-image span { position:absolute; left:16px; right:15px; bottom:10px; height:13px; border-radius:4px; background:#a18d82; }.review-content { min-width:0; flex:1; }.review-title { display:flex; align-items:center; gap:4px; font-size:12px; }.review-title span { color:#ff8a00; }.review-content small { display:block; margin:5px 0; color:#8a96a5; font-size:12px; }.review-content p { margin:0; overflow:hidden; color:#687587; font-size:12px; text-overflow:ellipsis; white-space:nowrap; }
</style>
