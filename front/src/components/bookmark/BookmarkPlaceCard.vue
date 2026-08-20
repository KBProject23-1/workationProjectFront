<script setup>
import { computed, ref, watch } from 'vue';
import { Heart, MapPin } from '@lucide/vue';
import { getMerchantDefaultImage } from '@/config/merchantDefaultImages';

const props = defineProps({
  bookmark: {
    type: Object,
    required: true,
  },
});

defineEmits(['remove', 'details']);

const imageLoadFailed = ref(false);
const defaultThumbnail = computed(
  () => getMerchantDefaultImage({
    category: props.bookmark.category,
    merchantId: props.bookmark.merchantId,
    activityType: props.bookmark.activityType,
  }),
);
const thumbnailSource = computed(
  () => props.bookmark.thumbnailUrl && !imageLoadFailed.value
    ? props.bookmark.thumbnailUrl
    : defaultThumbnail.value,
);

watch(
  () => [props.bookmark.thumbnailUrl, props.bookmark.category],
  () => {
    imageLoadFailed.value = false;
  },
);
</script>

<template>
  <article class="place-card">
    <img
      :src="thumbnailSource"
      :alt="`${bookmark.name} 대표 이미지`"
      @error="imageLoadFailed = true"
    />
    <div class="place-info">
      <h2>{{ bookmark.name }}</h2>
      <p class="rating"><span>★</span> {{ bookmark.rating }}</p>
      <p class="price">₩ {{ bookmark.price.toLocaleString() }} <span>/ 1박</span></p>
      <p class="address"><MapPin :size="12" />{{ bookmark.address }}</p>
    </div>
    <button class="heart-button" type="button" :aria-label="`${bookmark.name} 북마크 해제`" @click="$emit('remove', bookmark.bookmarkId)">
      <Heart :size="19" fill="currentColor" />
    </button>
    <button class="detail-button" type="button" @click="$emit('details', bookmark)">상세보기</button>
  </article>
</template>

<style scoped>
.place-card { position:relative; width:100%; height:112px; display:grid; grid-template-columns:86px 1fr; gap:14px; padding:7px; border:1.5px solid #e1e8f0; border-radius:17px; background:#fff; transition:background-color .15s ease,border-color .15s ease; }
.place-card:hover { border-color:#b9d6ff; background:#f7faff; }
.place-card > img { width:86px; height:98px; object-fit:cover; border-radius:8px; }
.place-info { min-width:0; padding-top:3px; }
h2,p { margin:0; }
h2 { overflow:hidden; padding-right:27px; color:#172033; font-size:16px; font-weight:800; line-height:1.35; text-overflow:ellipsis; white-space:nowrap; }
.rating { margin-top:5px; color:#718096; font-size:12px; }.rating span { color:#ff9418; }
.price { margin-top:4px; color:#172033; font-size:16px; font-weight:800; }.price span { font-size:12px; }
.address { position:absolute; left:107px; right:61px; bottom:11px; display:flex; align-items:center; gap:3px; overflow:hidden; color:#667085; font-size:12px; text-overflow:ellipsis; white-space:nowrap; }.address svg { flex:none; color:#0b5fae; }
button { font:inherit; cursor:pointer; }
.heart-button { position:absolute; top:10px; right:10px; width:26px; height:26px; display:grid; place-items:center; padding:0; color:#3087ed; border:0; background:transparent; }
.detail-button { position:absolute; right:9px; bottom:13px; height:25px; padding:0 11px; color:#267cf4; border:0; border-radius:999px; background:#eef6ff; font-size:12px; font-weight:800; transition:color .15s ease,background-color .15s ease; }
.detail-button:hover { color:#fff; background:#267cf4; }
</style>
