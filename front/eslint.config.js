import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier'; // prettier와 충돌하는 스타일 규칙 비활성화
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'dev-dist/**', 'src/components/ui/**'], // 빌드 산출물 및 shadcn-vue 생성 컴포넌트는 린트 대상에서 제외
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],

      // 여러 명이 동시 작업 시 콘솔 로그/디버거 코드가 커밋되는 것 방지
      'no-console': 'warn',
      'no-debugger': 'warn',

      // 선언했는데 안 쓰는 변수 감지
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // v-for에 key 빠뜨리는 실수 방지
      'vue/require-v-for-key': 'error',

      // 템플릿에서 정의 안 된 변수 쓰는 실수 방지
      'vue/no-undef-components': 'warn',
    },
  },
  eslintConfigPrettier,
];
