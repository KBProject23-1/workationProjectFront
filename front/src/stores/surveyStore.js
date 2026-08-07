import { defineStore } from 'pinia';
import {
  getSurveyQuestions,
  getMySurvey,
  createSurvey as createSurveyApi,
  updateSurvey as updateSurveyApi,
} from '@/api/survey';

// 한 페이지에 노출할 문항 수. 시안이 4문항을 2페이지로 나눈다
const QUESTIONS_PER_PAGE = 2;

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
    totalPages: (state) =>
      Math.max(Math.ceil(state.questions.length / QUESTIONS_PER_PAGE), 1),
    // 1부터 시작하는 페이지 번호로 문항을 잘라 준다
    questionsOfPage: (state) => (page) =>
      state.questions.slice(
        (page - 1) * QUESTIONS_PER_PAGE,
        page * QUESTIONS_PER_PAGE,
      ),
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

    // 응답이 없으면 404 가 온다. 아직 서버가 진행 중 워케이션을 요구해서 403 도 같은 뜻으로 본다
    async fetchMySurvey() {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getMySurvey();
        this.result = data;
        return data;
      } catch (err) {
        const status = err.response?.status;
        if (status === 404 || status === 403) {
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
