<script setup>
import { Minus, Plus, X } from '@lucide/vue';

const props = defineProps({ count: { type: Number, required: true } });
const emit = defineEmits(['close', 'update:count']);

function changeCount(amount) {
  emit('update:count', Math.min(10, Math.max(1, props.count + amount)));
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="guest-modal" role="dialog" aria-modal="true" aria-labelledby="guest-title">
      <header><h2 id="guest-title">인원 선택</h2><button type="button" aria-label="닫기" @click="emit('close')"><X /></button></header>
      <div class="guest-row">
        <div><strong>인원</strong><p>최대 10명까지 선택할 수 있어요</p></div>
        <div class="counter">
          <button type="button" aria-label="인원 줄이기" :disabled="count === 1" @click="changeCount(-1)"><Minus /></button>
          <strong>{{ count }}</strong>
          <button type="button" aria-label="인원 늘리기" :disabled="count === 10" @click="changeCount(1)"><Plus /></button>
        </div>
      </div>
      <button type="button" class="done" @click="emit('close')">완료</button>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop { position:fixed; inset:0; z-index:50; display:flex; align-items:flex-end; justify-content:center; background:rgb(17 24 39 / 45%); }
.guest-modal { width:min(430px,100%); padding:24px 24px 28px; border-radius:24px 24px 0 0; background:#fff; }
header,.guest-row,.counter { display:flex; align-items:center; justify-content:space-between; }
h2 { margin:0; font-size:22px; } header button { border:0; background:none; }
.guest-row { padding:34px 0; } .guest-row p { margin:5px 0 0; color:#8a96a5; font-size:12px; }
.counter { gap:18px; } .counter button { width:38px; height:38px; display:grid; place-items:center; border:1px solid #d7e0eb; border-radius:50%; background:#fff; color:#344356; }
.counter button:disabled { color:#c8d0da; } .done { width:100%; height:56px; border:0; border-radius:16px; color:#fff; background:#3087ed; font-size:16px; font-weight:750; }
</style>
