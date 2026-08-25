import { defineStore } from 'pinia';
import {
  getSurveyQuestions,
  getMySurvey,
  createSurvey as createSurveyApi,
  updateSurvey as updateSurveyApi,
} from '@/api/survey';

export const useSurveyStore = defineStore('survey', {
  state: () => ({
    // 문항 목록. 선택지까지 함께 내려온다
    questions: [],
    // 저장된 내 응답. 없으면 null
    result: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    hasAnswered: (state) => state.result !== null,
    surveyId: (state) => state.result?.surveyId ?? null,
    // { questionId: [optionId, ...] } 형태로 저장된 응답을 펴 준다
    selectedMap: (state) => {
      const map = {};
      (state.result?.questions ?? []).forEach((question) => {
        map[question.questionId] = [...(question.selectedOptionIds ?? [])];
      });
      return map;
    },
  },

  actions: {
    async fetchQuestions({ force = false } = {}) {
      if (!force && this.questions.length > 0) return this.questions;

      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getSurveyQuestions();
        this.questions = data.questions ?? [];
        return this.questions;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // 아직 응답하지 않았으면 404 가 온다. 오류가 아니라 빈 상태로 다룬다.
    // 서버가 진행 중 워케이션을 요구하던 시절의 403 처리는 걷어냈다.
    // 이제 403 은 진짜 권한 오류이므로 그대로 올려보낸다
    async fetchMySurvey() {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getMySurvey();
        this.result = data;
        return data;
      } catch (err) {
        if (err.response?.data?.errorCode === 'SURVEY_NOT_FOUND') {
          this.result = null;
          return null;
        }
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async createSurvey(answers) {
      try {
        const { data } = await createSurveyApi(answers);
        await this.fetchMySurvey();
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async updateSurvey(surveyId, answers) {
      try {
        const { data } = await updateSurveyApi(surveyId, answers);
        await this.fetchMySurvey();
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    reset() {
      this.questions = [];
      this.result = null;
      this.error = null;
    },
  },
});
