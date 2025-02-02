import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from '@eslint-react/eslint-plugin';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
    },
    rules: {
        // typescript-eslint rules
        '@typescript-eslint/ban-ts-comment': [
            'warn',
            {
                'ts-expect-error': 'allow-with-description',
                'ts-ignore': 'allow-with-description',
                'ts-nocheck': 'allow-with-description',
                'ts-check': 'allow-with-description',
            },
        ],
        '@typescript-eslint/no-empty-object-type': [
            'warn',
            {
                allowInterfaces: 'with-single-extends'
            }
        ],
        '@typescript-eslint/no-restricted-types': [
            'warn',
            {
                types: {
                    FC: 'Useless and has some drawbacks, see https: //github.com/facebook/create-react-app/pull/8177',
                    'React.FC':
                        'Useless and has some drawbacks, see https: //github.com/facebook/create-react-app/pull/8177',
                    FunctionComponent:
                        'Useless and has some drawbacks, see https: //github.com/facebook/create-react-app/pull/8177',
                    'React.FunctionComponent':
                        'Useless and has some drawbacks, see https: //github.com/facebook/create-react-app/pull/8177',
                    FunctionalComponent:
                        'Preact specific, useless and has some drawbacks, see https: //github.com/facebook/create-react-app/pull/8177',
                    'React.FunctionalComponent':
                        'Preact specific, useless and has some drawbacks, see https: //github.com/facebook/create-react-app/pull/8177',
                },
            },
        ],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-confusing-void-expression': [
            'warn',
            {
                ignoreArrowShorthand: true,
            },
        ],
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-invalid-void-type': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/no-throw-literal': 'off',
        '@typescript-eslint/no-unnecessary-type-arguments': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
);
