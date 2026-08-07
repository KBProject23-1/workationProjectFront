<script setup>
defineProps({
  product: { type: Object, required: true },
  selected: { type: Boolean, default: false },
});

defineEmits(['select']);
</script>

<template>
  <button
    type="button"
    class="product-card"
    :class="{ selected }"
    :aria-pressed="selected"
    @click="$emit('select', product.productName)"
  >
    <div class="product-image" aria-hidden="true">
      <div class="monitor"></div>
      <div class="chair"></div>
    </div>
    <div class="product-info">
      <strong>{{ product.productName }}</strong>
      <p>{{ product.description }}</p>
      <span>최대 {{ product.maxHeadcount }}명 이용 가능</span>
      <div class="price"><b>{{ product.price.toLocaleString() }}원</b></div>
    </div>
  </button>
</template>

<style scoped>
.product-card { width:100%; display:flex; gap:16px; padding:12px; text-align:left; color:#111827; border:1.5px solid #dbe3ee; border-radius:18px; background:#fff; box-shadow:0 2px 5px rgb(17 24 39 / 5%); cursor:pointer; }
.product-card.selected { border-color:#3087ed; box-shadow:0 0 0 1px #3087ed; }
.product-image { position:relative; width:96px; height:91px; flex:none; overflow:hidden; border-radius:14px; background:#c3ddff; }.monitor { position:absolute; top:13px; left:13px; right:13px; height:38px; border-radius:6px; background:#f2f7ff; }.monitor::after { content:''; position:absolute; left:29px; bottom:-10px; width:12px; height:10px; background:#9db5d1; }.chair { position:absolute; left:28px; right:24px; bottom:12px; height:15px; border-radius:7px; background:#9c887e; }.chair::before { content:''; position:absolute; top:-9px; left:-6px; right:-6px; height:8px; border-radius:5px; background:#a98d7d; }
.product-info { position:relative; min-width:0; flex:1; padding-bottom:28px; }.product-info > strong { display:block; margin-bottom:7px; font-size:16px; }.product-info p { margin:0 0 7px; color:#7b8794; font-size:12px; }.product-info > span { color:#09a69f; font-size:12px; font-weight:700; }.price { position:absolute; right:0; bottom:0; }.price b { font-size:22px; }
</style>
