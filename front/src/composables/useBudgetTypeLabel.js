import { computed, ref } from 'vue';
import { useCardStore } from '@/stores/cardStore';

// 카드 목록을 한 번이라도 받았는지. 화면을 옮겨도 유지되도록 모듈 밖에 둔다.
// cards 길이로 판단하면 카드가 아예 없는 사용자와 아직 안 받은 상태를 구분할 수 없다
const fetched = ref(false);

// 예산 유형(WORK / PERSONAL) 을 화면에 어떻게 부를지 정한다.
//
// 법인카드가 없는 사용자에게 "법인 예산" 은 맞지 않는 말이다.
// 그 사람은 개인카드로 결제하고 회사에 청구하므로 "업무 예산" 이라고 부른다.
// budget_type 값 자체는 바뀌지 않는다. 표기만 바뀐다.
export const useBudgetTypeLabel = () => {
  const cardStore = useCardStore();

  const hasCorporateCard = computed(() => cardStore.workCards.length > 0);

  // 아직 안 받았으면 판단을 보류한다.
  // 곧바로 "업무" 로 보여주면 법인카드가 있는 사용자의 라벨이 한 번 깜빡인다
  const workLabel = computed(() => {
    if (!fetched.value) return '법인';
    return hasCorporateCard.value ? '법인' : '업무';
  });

  const labelOf = (budgetType) =>
    budgetType === 'WORK' ? workLabel.value : '개인';

  const ensureCards = async () => {
    if (fetched.value) return;
    await cardStore.fetchMyCards();
    fetched.value = true;
  };

  return {
    hasCorporateCard,
    cardsLoaded: fetched,
    workLabel,
    labelOf,
    ensureCards,
  };
};
