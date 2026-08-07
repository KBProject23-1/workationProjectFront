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
    class="room-card"
    :class="{ selected }"
    :aria-pressed="selected"
    @click="$emit('select', product.productName)"
  >
    <div class="room-image" aria-hidden="true">
      <div class="room-window"></div>
      <div class="room-bed"><span></span></div>
    </div>
    <div class="room-info">
      <strong>{{ product.productName }}</strong>
      <p>{{ product.description }}</p>
      <small>최대 {{ product.maxHeadcount }}명</small>
      <span>예약 하루 전까지 무료 취소</span>
      <div class="room-price"><b>{{ product.price.toLocaleString() }}원</b> / 1박</div>
    </div>
  </button>
</template>

<style scoped>
.room-card { width:100%; display:flex; gap:16px; padding:12px; text-align:left; color:#111827; border:1.5px solid #dbe3ee; border-radius:18px; background:#fff; box-shadow:0 2px 5px rgb(17 24 39 / 5%); cursor:pointer; }
.room-card.selected { border-color:#3087ed; box-shadow:0 0 0 1px #3087ed; }
.room-image { position:relative; width:100px; height:96px; flex:none; overflow:hidden; border-radius:14px; background:#b9d7ff; }
.room-window { position:absolute; top:12px; left:10px; right:10px; height:43px; border-radius:9px; background:#eef5ff; }
.room-bed { position:absolute; left:22px; right:18px; bottom:17px; height:21px; border-radius:5px; background:#9c887e; }
.room-bed span { position:absolute; top:-9px; left:8px; right:8px; height:11px; border-radius:5px; background:#f2dfcf; }
.room-info { min-width:0; flex:1; position:relative; padding-bottom:28px; }
.room-info > strong { display:block; margin-bottom:7px; font-size:16px; }
.room-info p { margin:0 0 4px; color:#7b8794; font-size:12px; }.room-info small { display:block; margin-bottom:6px; color:#7b8794; font-size:12px; }
.room-info > span { color:#09a69f; font-size:12px; font-weight:700; }
.room-price { position:absolute; right:0; bottom:0; color:#7b8794; font-size:12px; }
.room-price b { color:#111827; font-size:22px; }
</style>
