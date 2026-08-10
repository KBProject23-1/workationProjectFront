import axios from 'axios';
import axiosInstance from './axiosInstance';

// 로그인. loginType 에 따라 필요한 필드가 다르다
// PASSWORD -> loginId + password / PIN -> pinNumber + deviceId
//
// 응답의 token_info 는 snake_case 다. 다른 API 와 달리 인증 스펙을 그대로 따른다
// data: { userId, name, token_info: { grant_type, access_token, access_token_expires_in } }
export const login = (payload) => {
  return axiosInstance.post('/auth/login', payload);
};

// 액세스 토큰 재발급
// refreshToken 은 HttpOnly 쿠키로만 오가므로 본문이 없다.
//
// axiosInstance 를 쓰면 이 요청의 401 이 다시 인터셉터를 타서 무한루프가 되므로
// 인터셉터가 없는 별도 인스턴스로 보낸다.
export const refresh = () => {
  return axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/refresh`,
    null,
    { withCredentials: true },
  );
};

// 로그아웃. 서버가 refreshToken 쿠키를 즉시 만료시킨다
export const logout = () => {
  return axiosInstance.post('/auth/logout');
};

// 회원가입 및 서비스 내에서 사용할 약관 목록과 본문 내용 조회
// GET /api/v1/auth/terms
export const getTerms = () => {
  return axiosInstance.get('/auth/terms');
};
