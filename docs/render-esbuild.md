# render-esbuild

Package folder: `packages/render-esbuild`

Package name: `gaclib-render-esbuild`

This package bundles browser-side view modules declared by `gaclib-render` `ViewMetadata`.

## Public API

- `buildViews(views)`: Asynchronously bundles each view metadata entry with esbuild.

For each view, `buildViews`:

1. Reads the compiled entry file from `./lib/views/${metadata.source}`.
2. Bundles it as an IIFE for the browser.
3. Writes it to `./lib/dist${metadata.path}`.
4. Uses a footer to assign `window['${metadata.name}'] = sanitizedName.viewExport`.

The output is minified, targets `es2022`, and uses `platform: 'browser'`.

## Usage Pattern

Both content packages have the same build script:

```ts
import { buildViews } from 'gaclib-render-esbuild';
import { views } from './views/index.js';

await buildViews(views);
```

The package assumes TypeScript has already compiled source files to `lib` and assets will be served from `lib/dist`.
