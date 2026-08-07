import axiosInstance from './axiosInstance';

// 설문 문항과 선택지 목록 조회
export const getSurveyQuestions = () => {
  return axiosInstance.get('/surveys/questions');
};

// 내 설문 응답 조회. 응답이 없으면 404 가 온다
export const getMySurvey = () => {
  return axiosInstance.get('/surveys/users');
};

// 설문 최초 저장
export const createSurvey = (answers) => {
  return axiosInstance.post('/surveys', { answers });
};

// 설문 응답 수정
export const updateSurvey = (surveyId, answers) => {
  return axiosInstance.patch(`/surveys/${surveyId}`, { answers });
};
