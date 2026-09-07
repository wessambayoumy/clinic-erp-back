// Run:
//   npx eslint . --max-warnings=0
//
// Note on `security/detect-object-injection`: it is intentionally noisy
// (high false-positive rate on any dynamic property access, including
// safe Map/Record lookups). It's enabled here as a reminder to review
// each hit manually rather than to be zero-warnings-clean; consider
// `eslint-disable-next-line` with a comment justifying safety at each
// genuine false positive rather than disabling the rule globally.

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import importPlugin from 'eslint-plugin-import';
import unicorn from 'eslint-plugin-unicorn';
import jsdoc from 'eslint-plugin-jsdoc';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig(
  // ---------------------------------------------------------------------
  // Global ignores
  // ---------------------------------------------------------------------
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'generated/**', // prisma client output, etc.
      '**/*.generated.ts',
      'eslint.config.mjs',
    ],
  },

  // ---------------------------------------------------------------------
  // Base recommended rule sets
  // ---------------------------------------------------------------------
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  security.configs.recommended,
  sonarjs.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  unicorn.configs.recommended,
  jsdoc.configs['flat/recommended-typescript'],

  // ---------------------------------------------------------------------
  // Project-wide language options
  // ---------------------------------------------------------------------
  {
    languageOptions: {
      parserOptions: {
        // Enables typed linting (required for strictTypeChecked, sonarjs
        // type-aware rules, and security rules that need type info).
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
    },
  },

  // ---------------------------------------------------------------------
  // TypeScript source rules
  // ---------------------------------------------------------------------
  {
    files: ['**/*.ts'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      // --- Naming conventions (project standard) ------------------------
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'enum',
          format: ['PascalCase'],
          suffix: ['Enum'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'property',
          format: null, // DTO/API fields, Prisma-generated shapes, header names, etc.
        },
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
      ],

      // --- Strictness / type safety --------------------------------------
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } }, // NestJS decorators return void-ish
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error', // pairs well with *Enum switches
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true },
      ],

      // --- Security --------------------------------------------------------
      // Blocks eval/child_process/Function() misuse, timing-unsafe RegExp,
      // buffer misuse, non-literal fs paths (path traversal), etc.
      'security/detect-object-injection': 'warn', // see note at top of file
      'security/detect-non-literal-fs-filename': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-pseudoRandomBytes': 'error', // catches Math.random() used where crypto.randomBytes belongs
      'security/detect-possible-timing-attacks': 'warn', // flags == on secrets; use crypto.timingSafeEqual
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',

      // --- Complexity / maintainability (SonarJS) ---------------------
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-identical-expressions': 'error',
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
      'sonarjs/no-nested-template-literals': 'error',

      // --- Import hygiene -----------------------------------------------
      'import/no-cycle': 'error', // critical for barrel-file (index.ts) architecture
      'import/no-self-import': 'error',
      'import/no-unresolved': 'off', // TS handles this; avoids resolver false positives on path aliases
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // --- Unicorn (dialed back for NestJS idioms) -----------------------
      'unicorn/prevent-abbreviations': 'off', // conflicts with req/res/dto/ctx conventions
      'unicorn/filename-case': ['error', { case: 'kebabCase' }], // matches Nest's *.service.ts, *.controller.ts
      'unicorn/no-null': 'off', // Prisma/DB layers use null intentionally, distinct from undefined
      'unicorn/no-array-reduce': 'off',

      // --- Misc correctness -----------------------------------------------
      'no-console': ['error', { allow: [] }], // force routing through LoggerService, not raw console.*
      eqeqeq: ['error', 'always'],
      'no-return-await': 'off', // superseded by @typescript-eslint/return-await
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
    },
  },

  // ---------------------------------------------------------------------
  // Barrel files (index.ts) — re-exports only
  // ---------------------------------------------------------------------
  {
    files: ['**/index.ts'],
    rules: {
      'import/export': 'error',
      'import/no-default-export': 'error', // barrels should use named re-exports for clean tree-shaking
    },
  },

  // ---------------------------------------------------------------------
  // NestJS-specific overrides (decorated classes need different rules)
  // ---------------------------------------------------------------------
  {
    files: [
      '**/*.controller.ts',
      '**/*.service.ts',
      '**/*.module.ts',
      '**/*.gateway.ts',
      '**/*.guard.ts',
      '**/*.interceptor.ts',
      '**/*.strategy.ts',
      '**/*.filter.ts',
    ],
    rules: {
      // Nest relies heavily on constructor DI; empty constructors are fine.
      '@typescript-eslint/no-useless-constructor': 'off',
      // Decorated classes commonly have single-method services/guards.
      'unicorn/no-static-only-class': 'off',
      // Interceptors/guards commonly implement an interface with unused generic params.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { args: 'after-used', argsIgnorePattern: '^_' },
      ],
    },
  },

  // ---------------------------------------------------------------------
  // DTOs — validation-heavy, decorator-driven, plain data shape
  // ---------------------------------------------------------------------
  {
    files: ['**/*.dto.ts'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'class',
          format: ['PascalCase'],
          suffix: ['Dto'],
        },
      ],
      'sonarjs/no-duplicate-string': 'off', // validation messages repeat legitimately
    },
  },

  // ---------------------------------------------------------------------
  // Test files — relaxed rules
  // ---------------------------------------------------------------------
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts', '**/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'no-console': 'off',
    },
  },

  // ---------------------------------------------------------------------
  // Prettier last: disables stylistic rules that would conflict with it
  // ---------------------------------------------------------------------
  prettier,
);
