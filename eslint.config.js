/**
 * ESLint configuration for TypeScript projects
 * Combines Base JavaScript rules, TypeScript-specific rules, and code quality checks
 * @fileoverview Linting configuration with TypeScript rules
 */

import js from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import security from 'eslint-plugin-security'
import sonarjs from 'eslint-plugin-sonarjs'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

/**
 * ESLint configuration array
 * @description Configuration array containing Base rules, TypeScript rules, and ignore patterns
 */
export default [
  js.configs.recommended,
  sonarjs.configs.recommended,
  prettierConfig,

  /**
   * TypeScript-specific ESLint configuration
   * @description Configuration object for TypeScript and TSX files with rules
   */
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    ignores: [],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        clearInterval: 'readonly',
        clearTimeout: 'readonly',
        console: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        module: 'readonly',
        performance: 'readonly',
        process: 'readonly',
        require: 'readonly',
        setInterval: 'readonly',
        setTimeout: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      security
    },
    rules: {
      // JavaScript Rules
      'arrow-spacing': 'error',
      'comma-dangle': ['error', 'never'],
      curly: ['error', 'all'],
      indent: 'off',
      'no-constant-condition': 'error',
      'no-control-regex': 'off',
      'no-duplicate-case': 'error',
      'no-empty': 'error',
      'no-empty-function': 'error',
      'no-extra-boolean-cast': 'error',
      'no-extra-parens': [
        'error',
        'all',
        {
          conditionalAssign: false,
          returnAssign: false,
          nestedBinaryExpressions: false,
          ignoreJSX: 'all'
        }
      ],
      'no-extra-semi': 'off',
      'no-func-assign': 'error',
      'no-inline-comments': 'error',
      'no-inner-declarations': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-obj-calls': 'error',
      'no-sparse-arrays': 'error',
      'no-unexpected-multiline': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-unused-expressions': 'error',
      'no-var': 'error',
      'no-console': 'off',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',
      'prefer-destructuring': [
        'error',
        {
          array: false,
          object: true
        }
      ],
      'prefer-template': 'error',
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'use-isnan': 'error',
      'valid-typeof': 'error',

      // TypeScript Rules
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/return-await': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/unbound-method': 'error',
      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/no-confusing-void-expression': 'error',
      '@typescript-eslint/no-meaningless-void-operator': 'error',
      '@typescript-eslint/no-mixed-enums': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/restrict-template-expressions': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/typedef': [
        'error',
        {
          arrayDestructuring: true,
          arrowParameter: true,
          memberVariableDeclaration: true,
          objectDestructuring: true,
          parameter: true,
          propertyDeclaration: true,
          variableDeclaration: true,
          variableDeclarationIgnoreFunction: false
        }
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid'
        },
        {
          selector: 'function',
          format: ['camelCase']
        },
        {
          selector: 'class',
          format: ['PascalCase']
        },
        {
          selector: 'interface',
          format: ['PascalCase']
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase']
        },
        {
          selector: 'enum',
          format: ['PascalCase']
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE']
        }
      ],

      // Code Quality & Complexity
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-identical-expressions': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/no-use-of-empty-return-value': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-small-switch': 'error',
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/no-useless-catch': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',
      'sonarjs/prefer-while': 'error',
      'sonarjs/array-callback-without-return': 'error',
      'sonarjs/argument-type': 'error',
      'sonarjs/arguments-order': 'error',
      'sonarjs/array-constructor': 'error',
      'sonarjs/assertions-in-tests': 'error',
      'sonarjs/function-return-type': 'error',
      'sonarjs/max-switch-cases': ['error', 30],
      'sonarjs/no-all-duplicated-branches': 'error',
      'sonarjs/no-array-delete': 'error',
      'sonarjs/no-commented-code': 'error',
      'sonarjs/no-dead-store': 'error',
      'sonarjs/no-duplicate-in-composite': 'error',
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-element-overwrite': 'error',
      'sonarjs/no-extra-arguments': 'error',
      'sonarjs/no-gratuitous-expressions': 'error',
      'sonarjs/no-ignored-return': 'error',
      'sonarjs/no-inverted-boolean-check': 'error',
      'sonarjs/no-misleading-array-reverse': 'error',
      'sonarjs/no-nested-switch': 'error',
      'sonarjs/no-nested-template-literals': 'error',
      'sonarjs/no-same-line-conditional': 'error',
      'sonarjs/no-tab': 'error',
      'sonarjs/no-try-promise': 'error',
      'sonarjs/no-unthrown-error': 'error',
      'sonarjs/no-useless-increment': 'error',
      'sonarjs/no-variable-usage-before-declaration': 'error',
      'sonarjs/non-existent-operator': 'error',
      'sonarjs/prefer-default-last': 'error',
      'sonarjs/prefer-object-literal': 'error',
      'sonarjs/prefer-promise-shorthand': 'error',
      'sonarjs/prefer-type-guard': 'error',
      'sonarjs/use-type-alias': 'error',

      // Security Vulnerability Detection
      'security/detect-buffer-noassert': 'warn',
      'security/detect-child-process': 'warn',
      'security/detect-disable-mustache-escape': 'warn',
      'security/detect-eval-with-expression': 'error',
      'security/detect-new-buffer': 'warn',
      'security/detect-no-csrf-before-method-override': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-non-literal-require': 'warn',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-pseudoRandomBytes': 'warn',
      'security/detect-unsafe-regex': 'warn'
    }
  },
  {
    ignores: ['node_modules/**', 'dist/**', '**/*.js', '**/*.d.ts', '**/*.txt', '**/*.md']
  }
]
