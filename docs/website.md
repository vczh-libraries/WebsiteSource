# website

Package folder: `packages/website`

Package name: `gaclib-website`

This package contains the main website content for `gaclib.net` and `vczh-libraries.github.io`. It is a browser-rendered site: the Node host serves skeleton HTML, bundled view scripts, XML-derived data, and static assets; actual page content is rendered by browser-side `lit-html` views.

## File Structure

- `src/index.ts`: Builds the router, registers static assets, registers content routes, and either hosts the site or downloads it.
- `src/topLevelPages.ts`: Defines top-level pages (`index`, `demo`, `document`, `contact`) and loads their XML articles.
- `src/homePages.ts`: Defines the home category routes, feature pages, article pages, and dynamic download URL list.
- `src/views/`: Browser-side view modules and their `ViewMetadata`.
- `src/views/index.ts`: Declares the view tree and the script/CSS files required by each view.
- `src/articles/`: XML content in the shared `gaclib-article` format.
- `src/esbuild.ts`: Calls `buildViews(views)` after TypeScript compilation.
- `assest/`: Static CSS, images, icon files, and resource images copied to `lib/dist` during build. The folder name is intentionally spelled as it exists in the repo.

## Routes

`src/index.ts` creates a plain router with no path prefix, registers `lib/dist` as static files, then registers home and top-level routes.

Top-level pages use:

```ts
route`/${{ page: '' }}.html`
```

The page key is looked up in `topLevelPages`. Valid public URLs are collected in `topLevelPageDynamicUrls`.

Home pages use:

```ts
route`/home/index.html`
route`/home/${{ path: [''] }}.html`
route`/home/${{ path: '' }}.html`
```

The array route handles nested category articles such as `/home/string-processing/regex.html`. The string route handles category feature pages such as `/home/gacui.html`. These URLs are collected in `homePageDynamicUrls`.

## Content Model

Every content file under `src/articles` is parsed by `parseArticle`. The main website does not add custom article plugins, so articles use only the shared tags documented in `docs/article.md`.

Home feature pages use a convention in `homePages.ts`: the first paragraph of a category article contains images whose `src` is the feature image and whose caption is the target article path. The remaining nested topics become feature descriptions.

## View Model

The main view chain is:

```text
Gaclib-RootView
Gaclib-RootView -> Gaclib-ArticleView
Gaclib-RootView -> Gaclib-HomeView -> Gaclib-HomeCategoryArticleView
Gaclib-RootView -> Gaclib-HomeView -> Gaclib-HomeCategoryFeatureView
```

Embedded resources include values such as `activeButton`, `activeCategory`, `article`, `homeArticle`, `categoryArticle`, and `featureList`. Browser views read them from `window["MVC-Resources.<name>"]`.

## Build, Start, Download

- `npm run build`: Clears `lib`, lints, compiles TypeScript, copies `assest` to `lib/dist`, then bundles views.
- `npm run start`: Hosts the site on `http://localhost:8080/index.html`.
- `npm run download`: Starts the same server internally, downloads static and dynamic URLs to `packages/website/lib/website`, then exits.
