import axiosInstance from './axiosInstance';

export const getBookmarks = (params) => {
  return axiosInstance.get('/bookmarks', { params });
};

// 가맹점 북마크 생성
export const createBookmark = (merchantId) => {
  return axiosInstance.post('/bookmarks', { merchantId });
};

// 생성된 북마크 번호로 북마크 삭제
export const deleteBookmark = (bookmarkId) => {
  return axiosInstance.delete(`/bookmarks/${bookmarkId}`);
};
