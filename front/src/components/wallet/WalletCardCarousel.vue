<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Star, Plus, Pencil, Trash2, QrCode } from '@lucide/vue';
import { formatCardNumber, cardGradient } from '@/utils/card';

const router = useRouter();

const props = defineProps({
  cards: { type: Array, default: () => [] },
});

defineEmits(['request-primary', 'request-delete', 'edit-nickname', 'add']);

function goToCardPay() {
  router.push('/wallet/pay');
}

const activeCardId = ref(
  props.cards.find((c) => c.isPrimary)?.cardId ??
    props.cards[0]?.cardId ??
    null,
);
let lastPrimaryId = props.cards.find((c) => c.isPrimary)?.cardId ?? null;

const orderedCards = computed(() =>
  [...props.cards].sort(
    (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0),
  ),
);

const activeCard = computed(() =>
  props.cards.find((c) => c.cardId === activeCardId.value),
);

// 선택된 카드가 항상 가운데 오도록 스크롤. 맨 앞/뒤 카드는 자연스럽게 clamp돼 한쪽만 여백이 남는다
const cardRefs = new Map();
function setCardRef(cardId, el) {
  if (el) cardRefs.set(cardId, el);
  else cardRefs.delete(cardId);
}

const scrollContainer = ref(null);

function scrollToActive() {
  const el = cardRefs.get(activeCardId.value);
  el?.scrollIntoView({
    behavior: 'smooth',
    inline: 'center',
    block: 'nearest',
  });
}

function selectCard(cardId) {
  activeCardId.value = cardId;
  nextTick(scrollToActive);
}

// 데스크톱은 터치 스와이프가 없으니 세로 휠 입력을 가로 스크롤로 변환
function handleWheel(e) {
  if (e.deltaY === 0) return;
  e.preventDefault();
  e.currentTarget.scrollBy({ left: e.deltaY });
}

// 휠/스와이프로 스크롤이 멈추면 가운데에 가장 가까운 카드를 선택된 카드로 표기
let scrollEndTimer = null;
function handleScroll() {
  clearTimeout(scrollEndTimer);
  scrollEndTimer = setTimeout(syncActiveWithScrollPosition, 120);
}

function syncActiveWithScrollPosition() {
  const container = scrollContainer.value;
  if (!container) return;
  const containerCenter =
    container.getBoundingClientRect().left + container.clientWidth / 2;

  let closestId = null;
  let closestDistance = Infinity;
  cardRefs.forEach((el, cardId) => {
    const rect = el.getBoundingClientRect();
    const distance = Math.abs(rect.left + rect.width / 2 - containerCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestId = cardId;
    }
  });

  if (closestId !== null && closestId !== activeCardId.value) {
    activeCardId.value = closestId;
  }
}

watch(
  () => props.cards,
  (newCards) => {
    const newPrimaryId = newCards.find((c) => c.isPrimary)?.cardId ?? null;
    const activeStillExists = newCards.some(
      (c) => c.cardId === activeCardId.value,
    );

    if (newPrimaryId !== lastPrimaryId) {
      // 주 카드가 바뀌면 선택도 그 카드를 따라가고 가운데로 스크롤
      lastPrimaryId = newPrimaryId;
      activeCardId.value = newPrimaryId ?? newCards[0]?.cardId ?? null;
      nextTick(scrollToActive);
    } else if (!activeStillExists) {
      // 선택된 카드가 삭제됐으면 주 카드나 첫 카드로 폴백
      activeCardId.value = newPrimaryId ?? newCards[0]?.cardId ?? null;
      nextTick(scrollToActive);
    }
  },
);

onMounted(() => {
  nextTick(scrollToActive);
  scrollContainer.value?.addEventListener('scroll', handleScroll, {
    passive: true,
  });
});

onUnmounted(() => {
  clearTimeout(scrollEndTimer);
  scrollContainer.value?.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="w-full">
    <!-- 카드 캐러셀 컨테이너 -->
    <div
      ref="scrollContainer"
      class="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-[calc(50%-7.5rem)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      @wheel="handleWheel"
    >
      <div
        v-for="card in orderedCards"
        :key="card.cardId"
        :ref="(el) => setCardRef(card.cardId, el)"
        class="relative shrink-0 snap-center rounded-[20px] text-white p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 ease-out overflow-hidden"
        :style="{
          background: cardGradient(card),
          width: '15rem',
          height: '9.2rem',
          transform: card.cardId === activeCardId ? 'scale(1)' : 'scale(0.9)',
          opacity: card.cardId === activeCardId ? 1 : 0.5,
          boxShadow:
            card.cardId === activeCardId
              ? '0 12px 24px -6px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
              : '0 4px 10px -2px rgba(0, 0, 0, 0.1)',
        }"
        @click="selectCard(card.cardId)"
      >
        <div
          class="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"
        />

        <div class="flex items-start justify-between relative z-10">
          <div
            class="w-9 h-6 rounded-md bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 p-[1px] shadow-inner relative overflow-hidden"
          >
            <div
              class="w-full h-full border border-amber-800/20 rounded-[5px] grid grid-cols-2 gap-0.5 p-0.5 opacity-60"
            >
              <div class="border-r border-b border-amber-900/30"></div>
              <div class="border-b border-amber-900/30"></div>
              <div class="border-r border-amber-900/30"></div>
              <div></div>
            </div>
          </div>

          <button
            type="button"
            class="-mt-1 -mr-1 p-1.5 rounded-full hover:bg-white/10 transition-colors"
            :aria-label="card.isPrimary ? '주 카드' : '주 카드로 설정'"
            @click.stop="$emit('request-primary', card.cardId)"
          >
            <Star
              :size="18"
              :class="
                card.isPrimary
                  ? 'text-yellow-300 fill-yellow-300 drop-shadow-[0_2px_4px_rgba(250,204,21,0.4)]'
                  : 'text-white/40 hover:text-white/70'
              "
            />
          </button>
        </div>

        <div class="flex items-end justify-between gap-1 relative z-10">
          <div class="flex flex-col min-w-0 flex-1">
            <span
              class="text-[11px] font-medium text-white/90 tracking-wider uppercase truncate"
            >
              {{ card.cardName || card.cardCompanyName }}
            </span>
            <span
              class="text-[13px] font-bold tracking-widest text-white/95 whitespace-nowrap mt-0.5"
            >
              {{ formatCardNumber(card.maskedNumber) }}
            </span>
          </div>

          <button
            type="button"
            class="shrink-0 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-all hover:bg-white/30 active:scale-95"
            aria-label="QR 결제"
            @click.stop="goToCardPay"
          >
            <QrCode :size="15" class="text-white drop-shadow" />
          </button>
        </div>
      </div>

      <button
        type="button"
        class="shrink-0 snap-center rounded-[20px] border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center gap-1.5 text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-500 active:scale-95"
        style="width: 15rem; height: 9.2rem"
        @click="$emit('add')"
      >
        <div
          class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500"
        >
          <Plus :size="18" />
        </div>
        <span class="text-[12px] font-medium">새 카드 추가</span>
      </button>
    </div>

    <div
      v-if="orderedCards.length > 1"
      class="flex justify-center items-center gap-1.5 mt-1"
    >
      <span
        v-for="card in orderedCards"
        :key="card.cardId"
        class="h-1.5 rounded-full transition-all duration-300"
        :class="
          card.cardId === activeCardId ? 'w-4 bg-gray-700' : 'w-1.5 bg-gray-200'
        "
      />
    </div>

    <div v-if="activeCard" class="flex justify-center mt-2.5">
      <div
        class="inline-flex items-center gap-0.5 p-0.5 bg-gray-100/80 backdrop-blur-sm rounded-full border border-gray-200/60 shadow-sm"
      >
        <button
          type="button"
          class="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-gray-600 transition-colors hover:bg-white hover:text-gray-900 active:scale-95"
          @click="$emit('edit-nickname', activeCard.cardId)"
        >
          <Pencil :size="11" />
          별칭 변경
        </button>
        <span class="w-px h-2.5 bg-gray-300/60"></span>
        <button
          type="button"
          class="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-red-700 transition-colors hover:bg-white hover:text-red-800 active:scale-95"
          @click="$emit('request-delete', activeCard.cardId)"
        >
          <Trash2 :size="11" />
          삭제
        </button>
      </div>
    </div>
  </div>
</template>
