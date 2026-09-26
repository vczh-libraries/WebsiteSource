import eslintShared from 'eslint-shared';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    ...eslintShared,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        files: ['assets/**/*.js'],
        extends: [tseslint.configs.disableTypeChecked],
        rules: {
            'no-undef': 'error',
        },
        languageOptions: {
            globals: {
                console: 'readonly',
                document: 'readonly',
                fetch: 'readonly',
                IntersectionObserver: 'readonly',
                localStorage: 'readonly',
                window: 'readonly',
            },
        },
    },
);
