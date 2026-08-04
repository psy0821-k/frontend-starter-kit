import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    ignores: ['node_modules', '.next', 'out', 'build', 'dist'],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@next/next': nextPlugin,
      import: importPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      '@next/next/no-html-link-for-pages': 'off',
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/shared',
              from: ['./src/features', './src/app'],
              message:
                'shared는 features, app을 import할 수 없습니다. 단방향: app → features → shared',
            },
            {
              target: './src/features',
              from: ['./src/app'],
              message:
                'features는 app을 import할 수 없습니다. 단방향: app → features → shared',
            },
            {
              target: './src/components/ui',
              from: ['./src/app', './src/features', './src/shared/ui'],
              message:
                'components/ui(shadcn 원본)는 직접 수정하지 마세요. shared/ui에서 래핑해서 사용하세요.',
            },
          ],
        },
      ],
    },
  },
];
