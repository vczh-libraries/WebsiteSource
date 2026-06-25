# eslint-shared

Package folder: `packages/eslint-shared`

Package name: `eslint-shared`

This private package exports the common ESLint configuration used by the TypeScript packages in the workspace.

## Public Surface

The package entry point is `eslint.config.mjs`. Other packages import it like this:

```js
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
    }
);
```

The shared config combines `@eslint/js` recommended rules and `typescript-eslint` recommended type-checked rules, ignores generated folders such as `lib` and `dist`, and disables a few rules that do not fit the style of this codebase.

There is no runtime API. Changes here affect linting for all packages that import `eslint-shared`.
