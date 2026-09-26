# website

Package folder: `packages/website`

Package name: `gaclib-website`

This package contains the main website content for `gaclib.net` and `vczh-libraries.github.io`. The home page is a manual HTML shell populated from JSON by its own browser script. The other pages use browser-side `lit-html` views, with the Node host serving skeleton HTML, bundled view scripts, XML-derived data, and static assets.

## File Structure

- `src/index.ts`: Builds the router, registers static assets, registers content routes, and either hosts the site or downloads it.
- `src/topLevelPages.ts`: Defines top-level article pages (`demo`, `document`, `contact`) and loads their XML articles.
- `src/homePages.ts`: Defines the home category routes, feature pages, article pages, and dynamic download URL list.
- `src/views/`: Browser-side view modules and their `ViewMetadata`.
- `src/views/index.ts`: Declares the view tree and the script/CSS files required by each view.
- `src/articles/`: XML content in the shared `gaclib-article` format.
- `src/esbuild.ts`: Calls `buildViews(views)` after TypeScript compilation.
- `assets/`: Static CSS, images, icon files, and resource images copied to `lib/dist` during build.
- `assets/index.html`: Manual home page shell and fixed tab headers.
- `assets/index.json`: Home page text, examples, links, feature descriptions, and screenshot URLs.
- `assets/homeres/`: Scripts, CSS, images, and other resources used only by the home page.

## Routes

`src/index.ts` creates a plain router with no path prefix, registers `lib/dist` as static files, then registers home and top-level routes.

Both `/` and `/index.html` serve the manual `assets/index.html` file. The root URL is an alias; static export writes the page to `index.html` through the registered file route. It does not generate a home article or export a second copy for `/`.

Other top-level pages use:

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

The home page loads `/index.json` from the site root. Its script uses a fixed JSON structure rather than the shared XML article parser. Keep visible content and image URLs in that data file; the HTML retains fixed controls and tab headers. GUI and TUI appearances share the same content and DOM, with presentation controlled by CSS. Tab contents are constructed as needed. A screenshot is requested only when its tab is selected and the gallery is on screen; its image node is retained after the first load.

`index.json` contains `text` (HTML element IDs mapped to text), navigation and action links, two `examples` (`hello` and `binding`), `platforms`, quick links, and feature group boxes. Each platform has a stable `id`, source link, and `modes`; each mode has `themes` with IDs matching the fixed HTML tab headers, image URLs, alt text, and dimensions. The examples are complete XML Instance definitions; their interactive HTML illustrations do not execute GacUI or Workflow.

Run `./packages/website/scripts/Copy-HomeScreenshots.ps1` from PowerShell to refresh screenshot copies from sibling `GacUI`, `wGac`, `iGac`, and `GacJS` repositories. Files are grouped under `assets/homeres/<repository>/`. The script preserves image bytes and chooses extensions from their actual format. Its optional `-MetadataPath` exports image IDs, URLs, and dimensions to help update the `platforms` data without overwriting edited page copy. If adding a theme, also update its fixed HTML tab header.

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

- `npm run build`: Clears `lib`, lints, compiles TypeScript, copies `assets` to `lib/dist`, then bundles views.
- `npm run start`: Hosts the site on `http://localhost:8080/` (also available at `/index.html`).
- `npm run download`: Starts the same server internally, downloads static and dynamic URLs to `packages/website/lib/website`, then exits.

The static download includes `index.html`, `index.json`, and every file under `homeres`, so it can be served without the Node content renderer. Downloading is a local verification step; it does not publish the site.
