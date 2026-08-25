<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Bed, Building2, Plus, Ticket, UtensilsCrossed, X } from '@lucide/vue';
import AtmosphereTagSelector from '@/components/review/AtmosphereTagSelector.vue';
import { getMerchantDefaultImage } from '@/config/merchantDefaultImages';

const props = defineProps({
  mode: { type: String, required: true },
  merchant: { type: Object, required: true },
  initialReview: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
});

const emit = defineEmits(['submit']);
const rating = ref(0);
const content = ref('');
const atmosphere = ref(null);
const imageFile = ref(null);
const imagePreview = ref('');
const fileInput = ref(null);
const merchantImageLoadFailed = ref(false);
const merchantImageIndex = ref(0);
const maxContentLength = 500;
const merchantCategoryIcons = {
  ACCOMMODATION: Bed,
  OFFICE: Building2,
  RESTAURANT: UtensilsCrossed,
  ACTIVITY: Ticket,
};
const merchantThumbnailClasses = {
  ACCOMMODATION: 'bg-brand-weak text-blue-400',
  OFFICE: 'bg-emerald-50 text-emerald-400',
  RESTAURANT: 'bg-warn-weak text-amber-400',
  ACTIVITY: 'bg-violet-50 text-violet-400',
};

const title = computed(() => (props.mode === 'edit' ? '리뷰 수정하기' : '리뷰 등록하기'));
const submitLabel = computed(() => (props.mode === 'edit' ? '저장하기' : '등록하기'));
const isOffice = computed(() => ['OFFICE', '공유오피스'].includes(props.merchant.category));
const merchantImageCandidates = computed(() =>
  [
    imagePreview.value,
    props.initialReview?.merchant?.thumbnailUrl,
    props.merchant.thumbnailUrl,
    getMerchantDefaultImage({
      category: props.merchant.category,
      merchantId: props.merchant.merchantId,
    }),
  ]
    .filter(Boolean)
    .filter((url, index, urls) => urls.indexOf(url) === index),
);
const merchantSummaryImage = computed(
  () => merchantImageCandidates.value[merchantImageIndex.value] ?? '',
);
const hasMerchantSummaryImage = computed(
  () => Boolean(merchantSummaryImage.value) && !merchantImageLoadFailed.value,
);
const merchantCategoryIcon = computed(
  () => merchantCategoryIcons[props.merchant.category] ?? Ticket,
);
const merchantThumbnailClass = computed(
  () =>
    merchantThumbnailClasses[props.merchant.category] ??
    'bg-canvas text-ink-mute',
);
const canSubmit = computed(
  () =>
    rating.value > 0 &&
    content.value.trim().length > 0 &&
    (!isOffice.value || atmosphere.value) &&
    !props.isSaving,
);

watch(
  () => props.initialReview,
  (review) => {
    if (!review) return;
    rating.value = review.rating;
    content.value = review.content;
    atmosphere.value = review.atmosphere || null;
    imagePreview.value = review.imageUrl || '';
  },
  { immediate: true },
);

watch(
  merchantImageCandidates,
  () => {
    merchantImageIndex.value = 0;
    merchantImageLoadFailed.value = false;
  },
);

function handleMerchantImageError() {
  if (merchantImageIndex.value < merchantImageCandidates.value.length - 1) {
    merchantImageIndex.value += 1;
    return;
  }
  merchantImageLoadFailed.value = true;
}

function chooseImage() {
  fileInput.value?.click();
}

function updateImage(event) {
  const [file] = event.target.files;
  if (!file) return;
  if (imagePreview.value.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value);
  imageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
}

function removeImage() {
  if (imagePreview.value.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value);
  imageFile.value = null;
  imagePreview.value = '';
  if (fileInput.value) fileInput.value.value = '';
}

function submitReview() {
  if (!canSubmit.value) return;
  emit('submit', {
    rating: rating.value,
    content: content.value.trim(),
    atmosphere: isOffice.value ? atmosphere.value : null,
    image: imageFile.value,
  });
}

onBeforeUnmount(() => {
  if (imagePreview.value.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value);
});
</script>

<template>
  <form
    class="review-form"
    :class="{ 'review-form--edit': mode === 'edit' }"
    @submit.prevent="submitReview"
  >
    <h1 class="sr-only">{{ title }}</h1>

    <section class="merchant-summary" aria-label="가맹점 정보">
      <div class="merchant-thumbnail" :class="merchantThumbnailClass">
        <img
          v-if="hasMerchantSummaryImage"
          :src="merchantSummaryImage"
          :alt="`${merchant.merchantName} 리뷰 이미지`"
          @error="handleMerchantImageError"
        />
        <component
          :is="merchantCategoryIcon"
          v-else
          class="merchant-thumbnail-placeholder"
          aria-label="가맹점 이미지 없음"
        />
      </div>
      <div class="merchant-info">
        <h2>{{ merchant.merchantName }}</h2>
        <p>{{ merchant.address }}</p>
      </div>
    </section>

    <section class="rating-field" aria-labelledby="rating-title">
      <h2 id="rating-title">평점</h2>
      <div class="star-buttons">
        <button
          v-for="score in 5"
          :key="score"
          type="button"
          :class="{ selected: score <= rating }"
          :aria-label="`${score}점`"
          @click="rating = score"
        >★</button>
      </div>
    </section>

    <section v-if="isOffice" class="atmosphere-field" aria-labelledby="atmosphere-title">
      <h2 id="atmosphere-title">분위기 태그</h2>
      <AtmosphereTagSelector v-model="atmosphere" />
    </section>

    <section class="photo-field">
      <h2>사진 (선택)</h2>
      <div class="photo-row">
        <div v-if="imagePreview" class="photo-preview">
          <img class="review-image-preview" :src="imagePreview" alt="선택한 리뷰 사진 미리보기" />
          <button type="button" aria-label="사진 제거" @click="removeImage"><X :size="18" /></button>
        </div>
        <button v-if="!imagePreview" type="button" class="add-photo" aria-label="사진 추가" @click="chooseImage">
          <Plus :size="47" :stroke-width="1.5" />
        </button>
        <button v-else type="button" class="add-photo" aria-label="사진 변경" @click="chooseImage">
          <Plus :size="47" :stroke-width="1.5" />
        </button>
        <input ref="fileInput" type="file" accept="image/*" :multiple="false" hidden @change="updateImage" />
      </div>
      <p>최대 1장까지 업로드할 수 있어요.</p>
    </section>

    <section class="content-field">
      <label for="review-content">리뷰 내용</label>
      <div class="textarea-wrap">
        <textarea id="review-content" v-model="content" :maxlength="maxContentLength" placeholder="이용 경험을 작성해 주세요."></textarea>
        <span>{{ content.length }} / {{ maxContentLength }}</span>
      </div>
    </section>

    <div class="submit-actions">
      <button type="submit" class="submit-button" :disabled="!canSubmit">
        {{ isSaving ? '저장 중...' : submitLabel }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.sr-only { position:absolute; width:1px; height:1px; padding:0; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
.review-form { display:flex; min-height:738px; flex-direction:column; }
.merchant-summary { display:flex; align-items:flex-start; gap:14px; }
.merchant-thumbnail { display:flex; width:116px; min-width:116px; max-width:116px; height:116px; min-height:116px; max-height:116px; flex:0 0 116px; align-items:center; justify-content:center; overflow:hidden; border-radius:var(--radius-chip); }
.merchant-thumbnail img { display:block; width:116px; min-width:116px; max-width:116px; height:116px; min-height:116px; max-height:116px; object-fit:cover; object-position:center; }
.merchant-thumbnail-placeholder { width:32px; height:32px; }
.merchant-info { min-width:0; padding-top:7px; }.merchant-info h2 { margin:0 0 8px; font-size:16px; font-weight:800; }
.merchant-info p { margin:0 0 7px; color:#7c8ca3; font-size:12px; white-space:nowrap; }
.merchant-info > span { display:inline-block; padding:6px 13px; color:#3087ed; border-radius:14px; background:#eaf3ff; font-size:12px; }
.rating-field { margin-top:28px; }.rating-field h2,.atmosphere-field h2,.content-field label,.photo-field h2 { margin:0 0 9px; color:#172033; font-size:12px; font-weight:800; }
.star-buttons { display:flex; gap:2px; }.star-buttons button { width:38px; height:42px; padding:0; color:#ced9e5; border:0; background:transparent; font-size:40px; line-height:1; cursor:pointer; }.star-buttons button.selected { color:#ff9500; }
.atmosphere-field { margin-top:27px; }
.content-field { margin-top:27px; }.content-field label { display:block; }.textarea-wrap { position:relative; }.textarea-wrap textarea { width:100%; height:160px; resize:none; padding:14px 15px 35px; color:#42546a; border:1.5px solid #d5e1ef; border-radius:17px; outline:none; background:#fff; font:12px/1.8 inherit; }.textarea-wrap textarea:focus { border-color:#3087ed; }.textarea-wrap > span { position:absolute; right:26px; bottom:17px; color:#6f7e91; font-size:12px; }
.photo-field { margin-top:27px; }.photo-field h2 { margin-bottom:17px; }.photo-row { display:flex; gap:12px; }.photo-preview { position:relative; }.photo-preview > button { position:absolute; top:6px; right:6px; width:23px; height:23px; display:grid; place-items:center; padding:0; color:#66778c; border:1px solid #b9c7d6; border-radius:50%; background:#fff; cursor:pointer; }.add-photo { width:150px; height:150px; display:grid; place-items:center; padding:0; color:#8fa2b8; border:1.5px dashed #cad8e7; border-radius:14px; background:#fff; cursor:pointer; }.photo-field > p { margin:10px 0 0; color:#76879c; font-size:12px; }
.review-image-preview { width:150px; height:150px; display:block; object-fit:cover; border-radius:14px; }
.submit-actions { margin-top:auto; }
.submit-button { width:100%; height:48px; color:#fff; border:0; border-radius:12px; background:#3087ed; font-size:16px; font-weight:500; cursor:pointer; }.submit-button:disabled { cursor:default; opacity:.55; }

.review-form--edit { min-height:0; gap:12px; }
.review-form--edit .merchant-summary,
.review-form--edit .rating-field,
.review-form--edit .atmosphere-field,
.review-form--edit .photo-field,
.review-form--edit .content-field { margin-top:0; padding:16px; border:1px solid var(--color-line); border-radius:var(--radius-card); background:var(--color-surface); box-shadow:var(--shadow-card); }
.review-form--edit .merchant-info p { line-height:1.5; white-space:normal; word-break:keep-all; }
.review-form--edit .rating-field h2,
.review-form--edit .atmosphere-field h2,
.review-form--edit .photo-field h2,
.review-form--edit .content-field label { font-size:14px; }
.review-form--edit .textarea-wrap textarea { font-size:13px; }
.review-form--edit .submit-actions { position:fixed; z-index:10; bottom:0; left:50%; width:min(430px,100%); padding:12px 20px calc(12px + env(safe-area-inset-bottom)); transform:translateX(-50%); border-top:1px solid var(--color-line); background:var(--color-surface); }
.review-form--edit .submit-button { height:52px; border-radius:14px; font-size:15px; font-weight:700; box-shadow:var(--shadow-cta); transition:transform .15s,background .15s; }
.review-form--edit .submit-button:active { transform:scale(.99); }

@media (max-width:360px) { .review-form--edit .submit-actions { padding-right:16px; padding-left:16px; } }
</style>
