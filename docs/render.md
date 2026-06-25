# render

Package folder: `packages/render`

Package name: `gaclib-render`

This package generates the HTML shell that hosts bundled browser-side views. It does not bundle view code itself; `render-esbuild` handles bundling.

## Public API

- `HtmlInfo`: Optional page metadata: `title`, `pathPrefix`, `shortcutIcon`, `styleSheets`, and `scripts`.
- `ViewMetadata`: A browser view declaration with `name`, `source`, `path`, optional `parentView`, optional `containerId`, and per-view `htmlInfo`.
- `EmbeddedResources`: Named JSON-serializable resources injected into the page.
- `mergeHtmlInfo(original, override)`: Applies scalar overrides and concatenates stylesheet/script arrays.
- `generateHtml(htmlInfo, views, viewName, mvcModel, extraHeadHtml, embeddedResources)`: Generates a complete HTML document for one MVC response.

## View Composition

Views form a parent chain. For example, `website-doc2` renders document pages through:

```text
Gaclib-RootView -> Gaclib-DirectoryView -> Gaclib-DocumentView
```

Every parent that contains a child must declare `containerId`. During generation, the child is rendered into that container. The top-level container is always `MVC-ViewContainer`.

Each bundled view must expose:

```ts
export const viewExport = {
    renderView(model: {}, target: HTMLElement): void {
        // render with lit-html
    }
};
```

`render-esbuild` publishes that export to `window[viewName]`.

## Generated Page Resources

`generateHtml` injects these resources:

- `mvcModel`
- `mvcViews`
- Every entry from `embeddedResources`

Each resource is written as JSON into a `<script>` block and also assigned to `window["MVC-Resources.<name>"]`. Browser-side views read shared data from those window entries, for example `window["MVC-Resources.article"]`.

`pathPrefix` from merged `HtmlInfo` is prepended to favicon, stylesheet, and script URLs. View scripts are automatically taken from the resolved view chain and can be extended by `HtmlInfo.scripts`.
