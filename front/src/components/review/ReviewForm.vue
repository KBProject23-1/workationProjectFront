<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { MapPin, Plus, X } from '@lucide/vue';

const props = defineProps({
  mode: { type: String, required: true },
  merchant: { type: Object, required: true },
  initialReview: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
});

const emit = defineEmits(['submit']);
const rating = ref(0);
const content = ref('');
const imageFile = ref(null);
const imagePreview = ref('');
const fileInput = ref(null);
const maxContentLength = 500;

const title = computed(() => (props.mode === 'edit' ? '리뷰 수정하기' : '리뷰 등록하기'));
const submitLabel = computed(() => (props.mode === 'edit' ? '저장하기' : '등록하기'));
const canSubmit = computed(() => rating.value > 0 && content.value.trim().length > 0 && !props.isSaving);

watch(
  () => props.initialReview,
  (review) => {
    if (!review) return;
    rating.value = review.rating;
    content.value = review.content;
    imagePreview.value = review.imageUrl || '';
  },
  { immediate: true },
);

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
  emit('submit', { rating: rating.value, content: content.value.trim(), image: imageFile.value });
}

onBeforeUnmount(() => {
  if (imagePreview.value.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value);
});
</script>

<template>
  <form class="review-form" @submit.prevent="submitReview">
    <h1 class="sr-only">{{ title }}</h1>

    <section class="merchant-summary" aria-label="가맹점 정보">
      <div class="room-image" role="img" aria-label="호텔 객실 이미지">
        <span class="wall"></span><span class="window"></span>
        <span class="bed"></span><span class="table"></span>
      </div>
      <div class="merchant-info">
        <h2>{{ merchant.merchantName }}</h2>
        <p><MapPin :size="20" /> {{ merchant.address }}</p>
        <span>{{ merchant.category }}</span>
      </div>
    </section>

    <fieldset class="rating-field">
      <legend>평점</legend>
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
    </fieldset>

    <section class="content-field">
      <label for="review-content">리뷰 내용</label>
      <div class="textarea-wrap">
        <textarea
          id="review-content"
          v-model="content"
          :maxlength="maxContentLength"
          placeholder="이용 경험을 작성해 주세요."
        ></textarea>
        <span>{{ content.length }} / {{ maxContentLength }}</span>
      </div>
    </section>

    <section class="photo-field">
      <h2>사진 (선택)</h2>
      <div class="photo-row">
        <div v-if="imagePreview" class="photo-preview">
          <div class="room-image" aria-hidden="true">
            <span class="wall"></span><span class="window"></span>
            <span class="bed"></span><span class="table"></span>
          </div>
          <button type="button" aria-label="사진 제거" @click="removeImage"><X :size="18" /></button>
        </div>
        <button v-if="!imagePreview" type="button" class="add-photo" aria-label="사진 추가" @click="chooseImage">
          <Plus :size="47" :stroke-width="1.5" />
        </button>
        <button v-else type="button" class="add-photo" aria-label="사진 변경" @click="chooseImage">
          <Plus :size="47" :stroke-width="1.5" />
        </button>
        <input ref="fileInput" type="file" accept="image/*" hidden @change="updateImage" />
      </div>
      <p>최대 1장까지 업로드할 수 있어요.</p>
    </section>

    <button type="submit" class="submit-button" :disabled="!canSubmit">
      {{ isSaving ? '저장 중...' : submitLabel }}
    </button>
  </form>
</template>

<style scoped>
.sr-only { position:absolute; width:1px; height:1px; padding:0; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
.review-form { display:flex; min-height:738px; flex-direction:column; }
.merchant-summary { display:flex; align-items:flex-start; gap:14px; }
.room-image { position:relative; width:96px; height:94px; flex:none; overflow:hidden; border-radius:8px; background:#b99573; }
.wall { position:absolute; inset:0 0 46%; background:linear-gradient(125deg,#4b4239 0 36%,#d6d4ce 36% 52%,#b7c5cd 52% 100%); }
.window { position:absolute; top:9%; right:4%; width:43%; height:40%; border:3px solid #332f2b; background:linear-gradient(145deg,#9eb8c4,#dbe3e5); }
.bed { position:absolute; left:13%; bottom:12%; width:68%; height:34%; border:5px solid #f7f3ed; border-radius:3px; background:#e8e0d6; transform:skewX(-7deg); }
.bed::before { content:''; position:absolute; left:8%; top:-13px; width:34%; height:12px; border-radius:3px; background:#fff; }
.table { position:absolute; right:5%; bottom:12%; width:13%; height:28%; background:#594838; }
.merchant-info { min-width:0; padding-top:7px; }.merchant-info h2 { margin:0 0 8px; font-size:16px; font-weight:800; }
.merchant-info p { display:flex; align-items:center; gap:3px; margin:0 0 7px; color:#7c8ca3; font-size:12px; white-space:nowrap; }.merchant-info p svg { flex:none; }
.merchant-info > span { display:inline-block; padding:6px 13px; color:#3087ed; border-radius:14px; background:#eaf3ff; font-size:12px; }
fieldset { min-width:0; margin:0; padding:0; border:0; }.rating-field { margin-top:28px; }.rating-field legend,.content-field label,.photo-field h2 { margin:0 0 9px; color:#172033; font-size:12px; font-weight:800; }
.star-buttons { display:flex; gap:2px; }.star-buttons button { width:38px; height:42px; padding:0; color:#ced9e5; border:0; background:transparent; font-size:40px; line-height:1; cursor:pointer; }.star-buttons button.selected { color:#ff9500; }
.content-field { margin-top:40px; }.content-field label { display:block; }.textarea-wrap { position:relative; }.textarea-wrap textarea { width:100%; height:160px; resize:none; padding:14px 15px 35px; color:#42546a; border:1.5px solid #d5e1ef; border-radius:17px; outline:none; background:#fff; font:12px/1.8 inherit; }.textarea-wrap textarea:focus { border-color:#3087ed; }.textarea-wrap > span { position:absolute; right:26px; bottom:17px; color:#6f7e91; font-size:12px; }
.photo-field { margin-top:27px; }.photo-field h2 { margin-bottom:17px; }.photo-row { display:flex; gap:12px; }.photo-preview { position:relative; }.photo-preview > button { position:absolute; top:2px; right:2px; width:23px; height:23px; display:grid; place-items:center; padding:0; color:#66778c; border:1px solid #b9c7d6; border-radius:50%; background:#fff; cursor:pointer; }.add-photo { width:97px; height:97px; display:grid; place-items:center; padding:0; color:#8fa2b8; border:1.5px dashed #cad8e7; border-radius:14px; background:#fff; cursor:pointer; }.photo-field > p { margin:10px 0 0; color:#76879c; font-size:12px; }
.submit-button { width:100%; max-width:340px; height:70px; align-self:center; margin-top:auto; color:#fff; border:0; border-radius:20px; background:#3087ed; font-size:24px; font-weight:800; cursor:pointer; }.submit-button:disabled { cursor:default; opacity:.55; }
</style>
