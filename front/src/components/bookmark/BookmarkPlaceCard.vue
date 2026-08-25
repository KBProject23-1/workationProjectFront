<script setup>
import { Bed, Building2, Heart, MapPin, Ticket, UtensilsCrossed } from '@lucide/vue';
import { computed, ref } from 'vue';

const props = defineProps({
  bookmark: {
    type: Object,
    required: true,
  },
});

defineEmits(['remove', 'details']);

const imageLoadFailed = ref(false);
const categoryIcons = {
  ACCOMMODATION: Bed,
  OFFICE: Building2,
  RESTAURANT: UtensilsCrossed,
  ACTIVITY: Ticket,
};
const thumbnailClasses = {
  ACCOMMODATION: 'bg-brand-weak text-blue-400',
  OFFICE: 'bg-emerald-50 text-emerald-400',
  RESTAURANT: 'bg-warn-weak text-amber-400',
  ACTIVITY: 'bg-violet-50 text-violet-400',
};
const priceUnits = {
  ACCOMMODATION: '/ 1박',
  OFFICE: '/ 1일',
};
const categoryIcon = computed(() => categoryIcons[props.bookmark.category] ?? Ticket);
const thumbnailClass = computed(
  () => thumbnailClasses[props.bookmark.category] ?? 'bg-canvas text-ink-mute',
);
const priceUnit = computed(() => priceUnits[props.bookmark.category] ?? '');
</script>

<template>
  <article class="place-card flex gap-4 rounded-card border border-line p-3 bg-surface shadow-card">
    <div class="place-thumbnail" :class="thumbnailClass">
      <img
        v-if="bookmark.thumbnailUrl && !imageLoadFailed"
        :src="bookmark.thumbnailUrl"
        :alt="`${bookmark.name} 대표 이미지`"
        @error="imageLoadFailed = true"
      />
      <component :is="categoryIcon" v-else class="h-8 w-8" />
    </div>
    <div class="place-info">
      <h2>{{ bookmark.name }}</h2>
      <p class="rating"><span>★</span> {{ Number(bookmark.rating ?? 0).toFixed(1) }}</p>
      <p class="price">{{ Number(bookmark.price ?? 0).toLocaleString() }}원 <span>{{ priceUnit }}</span></p>
      <p class="address"><MapPin :size="12" />{{ bookmark.address }}</p>
    </div>
    <button class="heart-button" type="button" :aria-label="`${bookmark.name} 북마크 해제`" @click="$emit('remove', bookmark.bookmarkId)">
      <Heart :size="19" fill="currentColor" />
    </button>
    <button class="detail-button" type="button" @click="$emit('details', bookmark)">상세보기</button>
  </article>
</template>

<style scoped>
.place-card { position:relative; width:100%; min-height:140px; transition:background-color .15s ease,border-color .15s ease; }
.place-card:hover { border-color:#84b9ff; background:#f5f9ff; box-shadow:0 6px 18px rgb(48 135 237 / 10%); }
.place-thumbnail { display:flex; width:116px; min-width:116px; max-width:116px; height:116px; min-height:116px; max-height:116px; flex:0 0 116px; align-items:center; justify-content:center; overflow:hidden; border-radius:var(--radius-chip); }
.place-thumbnail img { display:block; width:116px; min-width:116px; max-width:116px; height:116px; min-height:116px; max-height:116px; object-fit:cover; object-position:center; }
.place-info { min-width:0; padding-top:3px; }
h2,p { margin:0; }
h2 { overflow:hidden; padding-right:27px; color:#172033; font-size:16px; font-weight:800; line-height:1.35; text-overflow:ellipsis; white-space:nowrap; }
.rating { margin-top:5px; color:#718096; font-size:12px; }.rating span { color:#ff9418; }
.price { margin-top:4px; color:#172033; font-size:16px; font-weight:800; }.price span { font-size:12px; }
.address { position:absolute; left:144px; right:61px; bottom:14px; display:flex; align-items:center; gap:3px; overflow:hidden; color:#667085; font-size:12px; text-overflow:ellipsis; white-space:nowrap; }.address svg { flex:none; color:#0b5fae; }
button { font:inherit; cursor:pointer; }
.heart-button { position:absolute; top:10px; right:10px; width:26px; height:26px; display:grid; place-items:center; padding:0; color:#3087ed; border:0; background:transparent; }
.detail-button { position:absolute; right:9px; bottom:13px; height:25px; padding:0 11px; color:#267cf4; border:0; border-radius:999px; background:#eef6ff; font-size:12px; font-weight:800; transition:color .15s ease,background-color .15s ease; }
.detail-button:hover { color:#fff; background:#267cf4; }
</style>
