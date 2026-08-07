<script setup>
import { Minus, Plus, X } from '@lucide/vue';

const props = defineProps({
  roomCount: { type: Number, required: true },
  guestCount: { type: Number, required: true },
});

const emit = defineEmits(['close', 'update:roomCount', 'update:guestCount']);

function changeRoomCount(amount) {
  emit('update:roomCount', Math.min(5, Math.max(1, props.roomCount + amount)));
}

function changeGuestCount(amount) {
  emit('update:guestCount', Math.min(10, Math.max(1, props.guestCount + amount)));
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="occupancy-modal" role="dialog" aria-modal="true" aria-labelledby="occupancy-title">
      <header>
        <h2 id="occupancy-title">객실 · 인원 선택</h2>
        <button type="button" aria-label="닫기" @click="emit('close')"><X /></button>
      </header>

      <div class="counter-row">
        <div><strong>객실</strong><p>최대 5개까지 선택할 수 있어요</p></div>
        <div class="counter">
          <button type="button" aria-label="객실 줄이기" :disabled="roomCount === 1" @click="changeRoomCount(-1)"><Minus /></button>
          <strong>{{ roomCount }}</strong>
          <button type="button" aria-label="객실 늘리기" :disabled="roomCount === 5" @click="changeRoomCount(1)"><Plus /></button>
        </div>
      </div>

      <div class="counter-row">
        <div><strong>인원</strong><p>최대 10명까지 선택할 수 있어요</p></div>
        <div class="counter">
          <button type="button" aria-label="인원 줄이기" :disabled="guestCount === 1" @click="changeGuestCount(-1)"><Minus /></button>
          <strong>{{ guestCount }}</strong>
          <button type="button" aria-label="인원 늘리기" :disabled="guestCount === 10" @click="changeGuestCount(1)"><Plus /></button>
        </div>
      </div>

      <button type="button" class="done" @click="emit('close')">선택 완료</button>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop { position:fixed; inset:0; z-index:50; display:flex; align-items:flex-end; justify-content:center; background:rgb(17 24 39 / 45%); }
.occupancy-modal { width:min(402px,100%); padding:24px; border-radius:24px 24px 0 0; background:#fff; font-family:'SUIT Variable','SUIT',sans-serif; }
header,.counter-row,.counter { display:flex; align-items:center; justify-content:space-between; }
header { margin-bottom:10px; } h2 { margin:0; font-size:22px; } header button { border:0; background:none; }
.counter-row { padding:22px 0; border-bottom:1px solid #edf0f4; }.counter-row p { margin:5px 0 0; color:#8a96a5; font-size:12px; }
.counter { gap:18px; }.counter button { width:38px; height:38px; display:grid; place-items:center; border:1px solid #d7e0eb; border-radius:50%; color:#344356; background:#fff; }.counter button:disabled { color:#c8d0da; }
.done { width:100%; height:56px; margin-top:22px; border:0; border-radius:16px; color:#fff; background:#3087ed; font-size:16px; font-weight:800; }
</style>
