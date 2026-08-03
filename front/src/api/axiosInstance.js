import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  timeout: 10000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    error.message =
      error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
    if (error.response?.status === 401) {
      // 인증 만료 처리 (추후)
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
