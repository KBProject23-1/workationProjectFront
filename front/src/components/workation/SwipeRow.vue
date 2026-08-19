<template>
  <!--
    가로로 밀어 보는 줄. 스크롤바는 감추고 카드 왼쪽 끝에 스냅이 걸린다.
    좌우 여백은 부모가 가진 값을 그대로 쓴다. 제목과 카드 시작점이 어긋나면 안 된다
  -->
  <div
    ref="row"
    class="swipe-row flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1"
    @wheel="onWheel"
  >
    <slot />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const row = ref(null);

// 데스크톱 마우스 휠은 세로로만 움직인다.
// 가로 줄 위에서는 세로 움직임을 가로로 바꿔 준다.
//
// 트랙패드 가로 스와이프(deltaX)는 브라우저가 이미 처리하므로 건드리지 않는다.
// 줄 끝에 닿으면 막지 않고 페이지 스크롤로 넘긴다
const onWheel = (event) => {
  const element = row.value;
  if (!element || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

  const max = element.scrollWidth - element.clientWidth;
  if (max <= 0) return;

  // 한 번에 굴린 양이 남은 거리보다 크면 끝까지 붙인다.
  // 그냥 무시하면 마지막 카드에 영영 닿지 못한다
  const next = Math.min(Math.max(element.scrollLeft + event.deltaY, 0), max);
  if (next === element.scrollLeft) return;

  event.preventDefault();
  element.scrollLeft = next;
};
</script>

<style scoped>
/* Tailwind 에 스크롤바를 감추는 유틸리티가 없어 여기서 직접 쓴다 */
.swipe-row {
  scrollbar-width: none;
  -ms-overflow-style: none;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
}

.swipe-row::-webkit-scrollbar {
  display: none;
}
</style>
