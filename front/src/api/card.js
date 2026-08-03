import axiosInstance from './axiosInstance';

// 연동 가능 카드 조회
export const getAvailableCards = () => {
  return axiosInstance.get('/cards/available');
};

// 내 카드 목록 조회
export const getMyCards = () => {
  return axiosInstance.get('/cards');
};

// 카드 등록(연동)
export const linkCards = (linkableCardIds) => {
  return axiosInstance.post('/cards', { linkableCardIds });
};

// 대표 카드 설정
export const setPrimaryCard = (cardId) => {
  return axiosInstance.patch(`/cards/${cardId}/primary`);
};

// 카드 별칭 수정
export const updateCardNickname = (cardId, cardNickname) => {
  return axiosInstance.patch(`/cards/${cardId}/nickname`, { cardNickname });
};

// 카드 삭제
export const deleteCard = (cardId) => {
  return axiosInstance.delete(`/cards/${cardId}`);
};
