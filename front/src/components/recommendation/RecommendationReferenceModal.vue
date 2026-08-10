<script setup>
import { computed, ref, watch } from 'vue';
import { Search, X } from '@lucide/vue';

const REFERENCE_TYPE_LABELS = {
  AUTO_MERCHANT: '자동',
  AUTO_MIDPOINT: '자동',
  REGION_ONLY: '지역 기준',
  USER_SELECTED: '사용자 선택',
};

function getReferenceTypeLabel(referenceType) {
  return REFERENCE_TYPE_LABELS[referenceType] ?? referenceType;
}

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  currentPlace: {
    type: Object,
    default: null,
  },
  candidates: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close', 'select', 'select-auto']);

const selectionMode = ref('AUTO');
const searchKeyword = ref('');

const filteredCandidates = computed(() => {
  const keyword = searchKeyword.value.trim().toLocaleLowerCase('ko-KR');
  if (!keyword) return [];
  return props.candidates.filter((candidate) =>
    candidate.name.toLocaleLowerCase('ko-KR').includes(keyword),
  );
});

function selectAutomatic() {
  selectionMode.value = 'AUTO';
  emit('select-auto');
}

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    selectionMode.value = props.currentPlace?.type === 'USER_SELECTED' ? 'USER' : 'AUTO';
    searchKeyword.value = '';
  },
);
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <section class="reference-modal" role="dialog" aria-modal="true">
        <header>
          <h2>추천 기준 장소</h2>
          <button type="button" aria-label="닫기" @click="$emit('close')">
            <X :size="22" />
          </button>
        </header>

        <div v-if="currentPlace" class="reference-details">
          <span>{{ getReferenceTypeLabel(currentPlace.type) }}</span>
          <strong>{{ currentPlace.name }}</strong>
          <p>{{ currentPlace.description }}</p>
        </div>

        <h3>기준 방식을 선택해 주세요</h3>
        <div class="mode-list">
          <button
            type="button"
            :class="{ selected: selectionMode === 'AUTO' }"
            @click="selectAutomatic"
          >
            <span>
              <strong>자동</strong>
              <small>예약 정보를 기준으로 자동 선택</small>
            </span>
            <i></i>
          </button>
          <button
            type="button"
            :class="{ selected: selectionMode === 'USER' }"
            @click="selectionMode = 'USER'"
          >
            <span>
              <strong>사용자 직접 변경</strong>
              <small>장소 이름을 검색하여 직접 선택</small>
            </span>
            <i></i>
          </button>
        </div>

        <template v-if="selectionMode === 'USER'">
          <div class="direct-selection-panel">
            <label class="merchant-search">
              <Search :size="19" />
              <input
                v-model="searchKeyword"
                type="search"
                placeholder="장소 이름을 검색해 주세요"
              />
            </label>

            <div v-if="searchKeyword.trim()" class="candidate-list">
              <button
                v-for="candidate in filteredCandidates"
                :key="candidate.merchantId"
                type="button"
                :class="{
                  selected: currentPlace?.merchantId === candidate.merchantId,
                }"
                @click="$emit('select', candidate)"
              >
                <span>
                  <strong>{{ candidate.name }}</strong>
                  <small>{{ candidate.description }}</small>
                </span>
                <i></i>
              </button>
            </div>
            <p
              v-if="searchKeyword.trim() && !filteredCandidates.length"
              class="empty-result"
            >
              검색 결과가 없습니다.
            </p>
          </div>
        </template>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  z-index: 50;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgb(15 23 42 / 48%);
}

.reference-modal {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 430px;
  height: min(720px, 88vh);
  max-height: 88vh;
  overflow: hidden;
  padding: 24px 24px 36px;
  border-radius: 24px 24px 0 0;
  background: #ffffff;
}

.reference-modal header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reference-modal h2 {
  margin: 0;
  color: #14223a;
  font-size: 22px;
}

.reference-modal header button {
  display: flex;
  border: 0;
  background: transparent;
  color: #667085;
}

.reference-details {
  display: flex;
  flex-direction: column;
  margin-top: 24px;
  padding: 18px;
  border: 1.5px solid #c8dcff;
  border-radius: 14px;
  background: #f6f9ff;
}

.reference-modal h3 {
  margin: 24px 0 12px;
  color: #14223a;
  font-size: 16px;
}

.mode-list,
.candidate-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.direct-selection-panel {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  margin-top: 16px;
  padding: 14px;
  border: 1px solid #e3e8ef;
  border-radius: 18px;
  background: #f6f7f9;
}

.direct-selection-panel .candidate-list {
  min-height: 0;
  flex: 1;
  padding-right: 4px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.direct-selection-panel .candidate-list::-webkit-scrollbar {
  width: 5px;
}

.direct-selection-panel .candidate-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #c5ceda;
}

.direct-selection-panel .candidate-list::-webkit-scrollbar-track {
  background: transparent;
}

.mode-list button,
.candidate-list button {
  display: flex;
  width: 100%;
  min-height: 70px;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border: 1.5px solid #dce4ef;
  border-radius: 20px;
  background: #ffffff;
  text-align: left;
}

.mode-list button.selected,
.candidate-list button.selected {
  border-color: #3087ed;
  background: #f5f9ff;
}

.mode-list button span,
.candidate-list button span {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.mode-list button strong,
.candidate-list button strong {
  color: #14223a;
  font-size: 16px;
}

.mode-list button small,
.candidate-list button small {
  color: #7b8494;
  font-size: 12px;
}

.mode-list button i,
.candidate-list button i {
  width: 18px;
  height: 18px;
  border: 1.5px solid #a6b2c3;
  border-radius: 50%;
}

.mode-list button.selected i,
.candidate-list button.selected i {
  border: 5px solid #3087ed;
}

.merchant-search {
  display: flex;
  height: 48px;
  align-items: center;
  gap: 10px;
  margin: 0 0 12px;
  padding: 0 14px;
  border: 1.5px solid #c8dcff;
  border-radius: 14px;
  color: #667085;
  background: #ffffff;
}

.merchant-search:focus-within {
  border-color: #3087ed;
}

.merchant-search input {
  width: 100%;
  border: 0;
  outline: 0;
  color: #14223a;
  font: inherit;
}

.empty-result {
  margin: 24px 0 0;
  color: #7b8494;
  text-align: center;
}

.reference-details span {
  color: #3087ed;
  font-size: 11px;
  font-weight: 700;
}

.reference-details strong {
  margin-top: 8px;
  color: #14223a;
  font-size: 17px;
}

.reference-details p {
  margin: 7px 0 0;
  color: #7b8494;
  font-size: 13px;
}
</style>
