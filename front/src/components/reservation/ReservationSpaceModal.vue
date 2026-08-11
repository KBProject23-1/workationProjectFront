<script setup>
import { computed } from 'vue';
import { Minus, Plus, X } from '@lucide/vue';

const props = defineProps({
  count: { type: Number, required: true },
  productDetailType: { type: String, required: true },
});

const emit = defineEmits(['close', 'update:count']);

const isOfficeSeat = computed(() => props.productDetailType === 'OFFICE_SEAT');

function changeCount(amount) {
  if (isOfficeSeat.value) return;
  emit('update:count', Math.max(1, props.count + amount));
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="space-modal" role="dialog" aria-modal="true" aria-labelledby="space-title">
      <header>
        <h2 id="space-title">공간 수 선택</h2>
        <button type="button" aria-label="닫기" @click="emit('close')"><X /></button>
      </header>

      <div class="space-row">
        <div>
          <strong>공간 수</strong>
          <p v-if="isOfficeSeat">오픈좌석은 1개로 고정돼요</p>
          <p v-else>최소 1개 이상 선택해 주세요</p>
        </div>
        <div class="counter">
          <button
            type="button"
            aria-label="공간 수 줄이기"
            :disabled="isOfficeSeat || count === 1"
            @click="changeCount(-1)"
          >
            <Minus />
          </button>
          <strong>{{ count }}</strong>
          <button
            type="button"
            aria-label="공간 수 늘리기"
            :disabled="isOfficeSeat"
            @click="changeCount(1)"
          >
            <Plus />
          </button>
        </div>
      </div>

      <button type="button" class="done" @click="emit('close')">완료</button>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop { position:fixed; inset:0; z-index:50; display:flex; align-items:flex-end; justify-content:center; background:rgb(17 24 39 / 45%); }
.space-modal { width:min(430px,100%); padding:24px 24px 28px; border-radius:24px 24px 0 0; background:#fff; font-family:'SUIT Variable','SUIT',sans-serif; }
header,.space-row,.counter { display:flex; align-items:center; justify-content:space-between; }
h2 { margin:0; font-size:22px; } header button { border:0; background:none; }
.space-row { padding:34px 0; }.space-row p { margin:5px 0 0; color:#8a96a5; font-size:12px; }
.counter { gap:18px; }.counter button { width:38px; height:38px; display:grid; place-items:center; padding:0; color:#344356; border:1px solid #d7e0eb; border-radius:50%; background:#fff; cursor:pointer; }
.counter button:disabled { color:#c8d0da; background:#f4f6f8; cursor:not-allowed; opacity:.55; }
.done { width:100%; height:56px; border:0; border-radius:16px; color:#fff; background:#3087ed; font-size:16px; font-weight:750; }
</style>
