<template>
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45"
    @click.self="$emit('close')"
  >
    <section
      class="flex max-h-[80vh] w-full max-w-[402px] flex-col rounded-t-2xl bg-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reference-sheet-title"
    >
      <header class="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 id="reference-sheet-title" class="text-[16px] font-extrabold text-slate-900">
          기준 장소 선택
        </h2>
        <button type="button" aria-label="닫기" class="text-slate-400" @click="$emit('close')">
          <X :size="20" />
        </button>
      </header>

      <div class="px-5 pb-3">
        <label class="flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-3">
          <Search :size="16" class="shrink-0 text-slate-400" />
          <input
            v-model="keyword"
            type="search"
            placeholder="장소 이름 검색"
            aria-label="장소 이름 검색"
            class="w-full min-w-0 border-0 p-0 text-[14px] outline-none placeholder:text-slate-300"
          />
        </label>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <p v-if="isSearching" class="py-8 text-center text-[13px] text-slate-400">
          찾는 중...
        </p>

        <template v-else>
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 border-b border-slate-100 py-3 text-left"
            @click="$emit('select', null)"
          >
            <span class="min-w-0 flex-1">
              <span class="block truncate text-[14px] font-bold text-slate-800">
                이 지역 전체
              </span>
              <span class="block text-[11px] text-slate-400">
                기준 장소 없이 지역 안에서 찾아요
              </span>
            </span>

            <Check
              v-if="!selectedId"
              :size="18"
              class="shrink-0 text-blue-600"
            />
          </button>

          <!-- 검색어가 없을 때는 후보 목록을 그대로 보여준다 -->
          <button
            v-for="place in visiblePlaces"
            :key="place.merchantId"
            type="button"
            class="flex w-full items-center justify-between gap-3 border-b border-slate-100 py-3 text-left last:border-b-0"
            @click="$emit('select', place)"
          >
            <span class="min-w-0 flex-1">
              <span class="block truncate text-[14px] font-bold text-slate-800">
                {{ place.merchantName }}
              </span>
              <span class="block text-[11px] text-slate-400">
                {{ categoryLabel(place.category) }}
              </span>
            </span>

            <span
              v-if="place.reserved"
              class="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600"
            >
              예약함
            </span>
            <Check
              v-if="place.merchantId === selectedId"
              :size="18"
              class="shrink-0 text-blue-600"
            />
          </button>

          <p
            v-if="keyword && visiblePlaces.length === 0"
            class="py-10 text-center text-[13px] text-slate-400"
          >
            검색 결과가 없어요
          </p>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { Check, Search, X } from '@lucide/vue';
import { searchReferencePlaces } from '@/api/recommendation';

const CATEGORY_LABELS = {
  ACCOMMODATION: '숙소',
  OFFICE: '공유오피스',
  RESTAURANT: '음식점',
  ACTIVITY: '여가',
};

const props = defineProps({
  // 검색 없이 보여줄 기본 후보
  candidates: { type: Array, default: () => [] },
  // 추천 유형. 서버가 기준이 될 수 있는 업종으로 좁히는 데 쓴다
  type: { type: String, required: true },
  selectedId: { type: [String, Number], default: '' },
});

defineEmits(['select', 'close']);

const keyword = ref('');
const results = ref([]);
const isSearching = ref(false);

const visiblePlaces = computed(() =>
  keyword.value.trim() ? results.value : props.candidates,
);

const categoryLabel = (category) => CATEGORY_LABELS[category] ?? '';

// 글자를 칠 때마다 부르면 요청이 쏟아진다
let timer = null;

watch(keyword, (value) => {
  clearTimeout(timer);
  const trimmed = value.trim();

  if (!trimmed) {
    results.value = [];
    isSearching.value = false;
    return;
  }

  isSearching.value = true;
  timer = setTimeout(async () => {
    try {
      const { data } = await searchReferencePlaces({
        keyword: trimmed,
        type: props.type,
        size: 20,
      });
      results.value = data?.candidates ?? data?.content ?? [];
    } catch {
      results.value = [];
    } finally {
      isSearching.value = false;
    }
  }, 300);
});
</script>
