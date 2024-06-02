import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

/**
 * @typedef {import("eslint").Linter.FlatConfig[]} FlatConfigs
 */

/** @type { FlatConfigs } */
export default [
  // global settings
  {
    ignores: [
      'coverage',
      'example/**',
      'lib/**',
      'dist/**',
      'docsgen.config.js',
      'ship.config.js',
      'prettier.config.mjs'
    ]
  },

  // for javascript and environment
  {
    ...eslint.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es6
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  },

  // for typescript
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ]
    }
  },
  {
    files: ['**/*.{js,cjs,mjs}'],
    ...tseslint.configs.disableTypeChecked
  }

  // custom rules
  /*
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
  */
]
