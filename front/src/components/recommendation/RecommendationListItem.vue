<script setup>
import { computed, ref, watch } from 'vue';
import { Heart, MapPin } from '@lucide/vue';
import { getMerchantDefaultImage } from '@/config/merchantDefaultImages';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  ranking: {
    type: Number,
    required: true,
  },
  bookmarked: {
    type: Boolean,
    default: false,
  },
  bookmarkLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['detail', 'bookmark']);

const imageLoadFailed = ref(false);

watch(
  () => [props.item.thumbnailUrl, props.item.imageUrl, props.category],
  () => {
    imageLoadFailed.value = false;
  },
);

const defaultThumbnail = computed(
  () => getMerchantDefaultImage({
    category: props.category,
    merchantId: props.item.merchantId,
    activityType: props.item.activityType,
  }),
);

const thumbnailSource = computed(() => {
  const remoteThumbnail = props.item.thumbnailUrl || props.item.imageUrl;
  return remoteThumbnail && !imageLoadFailed.value
    ? remoteThumbnail
    : defaultThumbnail.value;
});
</script>

<template>
  <article class="result-card">
    <div class="ranking">{{ ranking }}</div>
    <img
      :src="thumbnailSource"
      :alt="`${item.name} 대표 이미지`"
      @error="imageLoadFailed = true"
    />

    <div class="result-content">
      <div class="result-title-row">
        <h2>{{ item.name }}</h2>
        <button
          type="button"
          class="bookmark-button"
          :class="{ bookmarked }"
          :aria-label="bookmarked ? '북마크 해제' : '북마크 추가'"
          :aria-pressed="bookmarked"
          :disabled="bookmarkLoading"
          :aria-busy="bookmarkLoading"
          @click="$emit('bookmark', item)"
        >
          <Heart :size="18" :fill="bookmarked ? 'currentColor' : 'none'" />
        </button>
      </div>
      <p class="rating">
        <span>★</span> {{ item.rating ?? '-' }}
        <template v-if="item.reviewCount != null"> ({{ item.reviewCount }})</template>
      </p>
      <strong>₩ {{ Number(item.price ?? 0).toLocaleString() }} / 1박</strong>
      <div class="result-bottom-row">
        <p><MapPin :size="12" /> {{ item.address }}</p>
        <button
          type="button"
          class="detail-button"
          @click="$emit('detail', item)"
        >
          상세보기
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.result-card {
  position: relative;
  display: flex;
  width: 350px;
  max-width: 100%;
  min-height: 130px;
  gap: 14px;
  padding: 8px;
  border: 1.5px solid #e4eaf2;
  border-radius: 15px;
  background: #ffffff;
}

.result-card:hover {
  border-color: #84b9ff;
  background: #f5f9ff;
  box-shadow: 0 6px 18px rgb(48 135 237 / 10%);
}

.result-card > img {
  width: 90px;
  min-width: 90px;
  height: 112px;
  border-radius: 8px;
  object-fit: cover;
}

.ranking {
  position: absolute;
  top: 5px;
  left: 5px;
  z-index: 1;
  display: flex;
  width: 21px;
  height: 21px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #3087ed;
  color: #ffffff;
  font-size: 12px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 18%);
}

.result-content {
  min-width: 0;
  flex: 1;
  padding: 1px 2px 0 0;
}

.result-title-row,
.result-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.result-title-row h2 {
  overflow: hidden;
  margin: 0;
  color: #16233a;
  font-size: 16px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookmark-button {
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  color: #88a0bf;
  cursor: pointer;
  transition:
    color 0.16s ease,
    transform 0.16s ease;
}

.bookmark-button:hover {
  color: #3087ed;
  transform: scale(1.1);
}

.bookmark-button.bookmarked {
  color: #3087ed;
}

.bookmark-button:disabled {
  cursor: wait;
  opacity: 0.55;
}

.rating {
  margin: 8px 0 6px;
  color: #8b94a3;
  font-size: 12px;
}

.rating span {
  color: #ff9d2e;
}

.result-content > strong {
  color: #152238;
  font-size: 16px;
}

.result-bottom-row {
  margin-top: 7px;
}

.result-bottom-row p {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  margin: 0;
  color: #7f8a9a;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-button {
  flex: 0 0 auto;
  height: 25px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: #eaf4ff;
  color: #3087ed;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.16s ease,
    color 0.16s ease;
}

.detail-button:hover {
  background: #3087ed;
  color: #ffffff;
}
</style>
