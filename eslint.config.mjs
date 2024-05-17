// @ts-check

import tseslint from 'typescript-eslint'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default tseslint.config(
  // base configuration
  {
    files: ['**/*.ts'],
    ignores: ['./lib'],
    languageOptions: {
      globals: {
        page: true,
        browser: true,
        context: true
      }
    }
  },

  // setup typescript rules
  ...tseslint.configs.recommended,

  // setup prettier, includes eslint-config-prettier
  eslintPluginPrettierRecommended,

  // custom rules
  {
    rules: {
      'object-curly-spacing': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/member-delimiter-style': 'off',
      '@typescript-eslint/no-use-before-define': 'off'
    }
  }
)
