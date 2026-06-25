# website-doc2

Package folder: `packages/website-doc2`

Package name: `gaclib-website-doc2`

This package contains the latest GacUI 2.0 documentation site. Like `website`, it serves a browser-rendered site, but its content is organized by a reference tree and supports several document-specific XML templates.

## File Structure

- `src/index.ts`: Loads the document tree, registers routes, renders pages by node kind, downloads static HTML, or generates markdown.
- `src/treeView.ts`: Parses `src/articles/reference.xml` and linked `entry.xml` files into a `DocTree`.
- `src/markdown.ts`: Converts selected article pages into markdown files for downstream repos.
- `src/views/`: Browser-side views for root layout, directory navigation, articles, namespaces, API documents, registered types, and unfinished pages.
- `src/views/index.ts`: Declares the document view tree.
- `src/plugins/article/`: Custom article plugins for `<sample>` and `<control-templates>`.
- `src/plugins/control-template/`: Parser and renderer for control-template document pages plus generated metadata helpers.
- `src/plugins/document/`: Symbol-link conversion and example retrieval for processed API documentation.
- `src/plugins/registeredTypes/`: Parser for external reflection metadata. The registered-types view path is currently wired to the unfinished view in `src/index.ts`.
- `src/articles/reference.xml`: The top-level category and page tree.
- `src/articles/**/entry.xml`: Nested reference fragments included by `<link>` nodes.
- `src/articles/**/*.xml`: Hand-written article pages, generated API document pages, and control-template document pages.
- `assest/`: CSS, icons, images, and screenshots copied to `lib/dist`.

## Route Model

The router uses the path prefix `/doc/current`:

```ts
const router = createRouter<MvcRouterResult>('/doc/current');
route`/${{ path: [''] }}.html`
```

Every document page is matched by the trailing string-array route. The array is used to step through the `DocTreeIndex`; the selected node then determines how the page is rendered.

## Reference Tree Syntax

`reference.xml` and linked entries use this shape:

```xml
<reference>
  <article name="GacUI" file="gacui/home">
    <article name="Knowledge Base" file="gacui/kb/home">
      <link pathPrefix="gacui/kb" filePrefix="" file="gacui/kb/entry.xml"/>
    </article>
  </article>
</reference>
```

Supported node tags:

- `<article name="..." file="...">`: A normal article page. `file` maps to both the URL path and `src/articles/<file>.xml`.
- `<registeredTypes name="..." file="...">`: A registered-types page path.
- `<unfinished name="..." file="...">`: A placeholder page.
- `<namespace name="...">`: A namespace directory page. `::` is converted to `_` in the URL path.
- `<document name="...">`: A category-only tree item. It has no URL and no page of its own, and only groups nested reference nodes.
- `<document name="..." docId="..." file="...">`: A generated API document page.
- `<control-template ct="..." file="...">`: A generated control-template page.
- `<link pathPrefix="..." filePrefix="..." file="..."/>`: Includes another reference XML file. `pathPrefix` extends the URL path; `filePrefix` extends the source-file directory.

This nested tree is the category system. Pages are grouped by parent reference nodes, and each category may include more nested templates through `<link>`. Use a `<document name="...">` node without `file` when the left tree needs a collapsible category but clicking the category itself should not open a document page.

## Page Rendering By Node Kind

`src/index.ts` handles node kinds as follows:

- `article`: Parse `gaclib-article` XML with `parseArticlePlugin`, consume plugins with `renderArticlePlugin`, and render `Gaclib-ArticleView`.
- `control-template`: Parse `<control-template-document>`, render it to an article, consume article plugins, and render `Gaclib-ArticleView`.
- `document`: Parse `<Document>` XML with `parseDocArticle`, convert symbols with the document tree index, render a document article, and render `Gaclib-DocumentView`.
- `namespace`: Render `Gaclib-NamespaceView`.
- `registeredTypes`: Intended to render registered type metadata; currently routes to `Gaclib-UnfinishedView`.
- `unfinished`: Render `Gaclib-UnfinishedView`.

Every page also receives `hrefPrefix` and `directoryInfo` embedded resources so links and the left-side directory tree work under `/doc/current`.

## Custom Article Tags

In addition to the shared article syntax, document articles may use:

```xml
<sample name="layout_bounds"/>
<sample name="kb_xmlres_data" file="TextPage" image="kb_xmlres_tag_text.gif"/>
<sample url="https://github.com/vczh-libraries/Release/blob/master/..." image="kb_controls_datagrid.gif"/>
<control-templates details="true"/>
```

`<sample>` renders a source-code link and an image. The allowed attribute sets are `name`, `name + image`, `name + file + image`, or `url + image`.

`<control-templates>` renders the control-template hierarchy from metadata. `details="true"` links documented templates and lists theme names.

## Control-Template Documents

Control-template pages use:

```xml
<control-template-document name="ButtonTemplate">
  <introduction>
    <p>...</p>
  </introduction>
  <inputs>
    <prop name="State">
      <p>...</p>
    </prop>
  </inputs>
  <outputs/>
  <exchanges/>
  <samples/>
</control-template-document>
```

`xmlControlTemplateCommon.ts` loads `metadata/themeNames.json`, `metadata/hierarchy.json`, and `metadata/properties.json`, initializes the hierarchy, regenerates `entry.xml` when needed, and creates missing template document files under `documents/`.

## API Document Pages

Generated API pages use the `<Document>` format documented in `docs/article-document.md`. Symbol links resolve through `docTree.ids`, which is filled from `docId` attributes in reference nodes. Example pages can use `<example index="N"/>`, which loads nearby `.ein.N.xml` and `.eout.N.txt` files and merges the example into a project-specific C++ template.

## Markdown Export

`npm run markdown` calls `convertDocumentToMarkdown`. It writes:

- `lib/markdown/index.md`
- `lib/markdown/docTree.md`
- `lib/markdown/manual/**/*.md`

The markdown converter intentionally focuses on article pages. It skips some first-level documentation categories and reports unsupported content, missing article URLs, or unsupported links.

## Build, Start, Download

- `npm run build`: Clears `lib`, lints, compiles TypeScript, copies `assest` to `lib/dist`, then bundles views.
- `npm run start`: Hosts `http://localhost:8080/doc/current/home.html`.
- `npm run download`: Downloads the static document site to `packages/website-doc2/lib/website`.
- `npm run markdown`: Generates markdown output for publishing into downstream repos.
