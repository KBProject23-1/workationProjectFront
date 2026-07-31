import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier'; // prettier와 충돌하는 스타일 규칙 비활성화
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'dev-dist/**'], // 빌드 산출물은 린트 대상에서 제외
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
    },
  },
  eslintConfigPrettier,
];
