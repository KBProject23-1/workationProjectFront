import axiosInstance from './axiosInstance';

// 회원가입 및 서비스 내에서 사용할 약관 목록과 본문 내용 조회
// GET /api/v1/auth/terms
export const getTerms = () => {
  return axiosInstance.get('/auth/terms');
};
