import { defineStore } from 'pinia';
import {
  getReservationDetails,
  getReservationList,
} from '@/api/reservations';

const PAGE_SIZE = 10;
const DEFAULT_RESERVATION_STATUSES = ['CONFIRMED', 'COMPLETED'];

// 최초 조회와 재조회에서 동일한 페이지 상태를 사용하기 위한 초기값 생성
function createPagination() {
  return {
    page: 0,
    totalPages: 0,
  };
}

// 공통 오류 응답과 PageResponseDTO 구조를 검증해 잘못된 값을 목록에 저장하지 않도록 방어
function getReservationPage(data) {
  if (data?.status === 'ERROR') {
    throw new Error(data.message || '예약 내역을 불러오지 못했습니다.');
  }

  if (!data || !Array.isArray(data.content)) {
    throw new Error('예약 목록 응답 형식이 올바르지 않습니다.');
  }

  return data;
}

export const useReservationStore = defineStore('reservation', {
  state: () => ({
    reservations: [],
    reservationStatuses: [...DEFAULT_RESERVATION_STATUSES],
    pagination: createPagination(),
    isLoading: false,
    isLoadingMore: false,
    error: null,
    reservationDetail: null,
    isDetailLoading: false,
    detailError: null,
  }),

  getters: {
    hasMore: (state) =>
      state.pagination.page + 1 < state.pagination.totalPages,
  },

  actions: {
    // 선택한 탭의 예약 상태를 기준으로 첫 페이지부터 다시 조회하는 처리
    async fetchReservations(statuses = DEFAULT_RESERVATION_STATUSES) {
      this.isLoading = true;
      this.error = null;
      this.reservations = [];
      this.reservationStatuses = [...statuses];
      this.pagination = createPagination();

      try {
        const { data } = await getReservationList({
          status: this.reservationStatuses,
          page: 0,
          size: PAGE_SIZE,
        });
        const reservationPage = getReservationPage(data);

        this.reservations = reservationPage.content;
        this.pagination = {
          page: reservationPage.page,
          totalPages: reservationPage.totalPages,
        };
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },

    // 현재 탭의 다음 페이지를 기존 예약 뒤에 이어 붙이는 추가 조회 처리
    async fetchMoreReservations() {
      if (this.isLoading || this.isLoadingMore || !this.hasMore) return;

      this.isLoadingMore = true;
      try {
        const nextPage = this.pagination.page + 1;
        const { data } = await getReservationList({
          status: this.reservationStatuses,
          page: nextPage,
          size: PAGE_SIZE,
        });
        const reservationPage = getReservationPage(data);

        this.reservations = [
          ...this.reservations,
          ...reservationPage.content,
        ];
        this.pagination = {
          page: reservationPage.page,
          totalPages: reservationPage.totalPages,
        };
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoadingMore = false;
      }
    },

    // URL 예약 식별자로 예약 확정·이용 완료 상세를 새로 조회하는 처리
    async fetchReservationDetails(reservationId) {
      this.isDetailLoading = true;
      this.detailError = null;
      this.reservationDetail = null;

      try {
        const { data } = await getReservationDetails(reservationId);

        if (!data?.reservationId || !data.merchant || !data.reservationProduct) {
          throw new Error('예약 상세 응답 형식이 올바르지 않습니다.');
        }

        this.reservationDetail = data;
      } catch (error) {
        this.detailError = error.message;
      } finally {
        this.isDetailLoading = false;
      }
    },
  },
});
