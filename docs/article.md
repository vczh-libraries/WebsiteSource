# article

Package folder: `packages/article`

Package name: `gaclib-article`

This package owns the shared XML article format used by both `website` and `website-doc2`. It parses article XML into an in-memory tree, lets content packages consume custom plugin nodes, and renders the final tree with `lit-html`.

## Public API

- `parseArticle(xml, pluginParser?)`: Parses an XML string whose root is `<article>` and returns an `Article`. Unknown XML elements inside paragraph content are offered to `pluginParser`; returning a `Plugin` defers that node until `consumePlugin`.
- `parseParagraph(xmlParagraph, pluginParser)`: Parses one `<p>` element into a `Paragraph`. This is used by higher-level parsers such as `article-document` and `website-doc2` control-template documents.
- `trimEmptyLines(cdataContainer)`: Reads one or more CDATA nodes, strips leading and trailing empty lines, removes common indentation, and joins lines with the platform EOL. It is used for `<program><code>`, `<program><output>`, and generated examples.
- `consumePlugin(article, pluginConverter)`: Walks an `Article` recursively and replaces every `Plugin` content item with normal article content returned by `pluginConverter`.
- `renderArticle(article, options?)`: Converts a plugin-free `Article` to a `lit-html` template. `options.hrefPrefix` is prepended to absolute links that start with `/`; `options.buildIndex` is currently initialized from `article.index`.

The exported interfaces in `interfaces.ts` are the canonical article AST: `Article`, `Topic`, `Paragraph`, and `Content` variants such as `Text`, `PageLink`, `Image`, `List`, `Program`, and `Plugin`.

## Article XML

An article has one root topic:

```xml
<article index="true" numberBeforeTitle="true">
  <topic anchor="optional-anchor">
    <title>Article Title</title>
    <p>Paragraph content.</p>
    <topic>
      <title>Nested Topic</title>
    </topic>
  </topic>
</article>
```

`index` enables a generated topic index at render time. `numberBeforeTitle` makes nested topics receive numeric prefixes. `anchor` is optional; when omitted, rendering derives one from the topic title and de-duplicates it inside the article.

Inside `<topic>`, only `<title>`, `<p>`, and nested `<topic>` are accepted. A topic must contain exactly one title, but the title may appear before or after other topic children in the XML.

## Paragraph Content

`<p>` supports text and these built-in elements:

- `<a href="...">...</a>`: A link whose body is normal inline content.
- `<as><a href="...">text</a><a href="..."/><a href="..."/></as>`: A multi-page link. The first `<a>` supplies the visible content and all `<a>` elements supply candidate URLs.
- `<name>GuiControl</name>`: Inline API/code name, rendered with class `name`.
- `<img src="/path.png"/>` or `<img src="/path.png">Caption</img>`: Image or figure.
- `<ul>` and `<ol>` with `<li>` children: List items contain either inline content or only `<p>` children.
- `<b>...</b>`: Strong text.
- `<em>...</em>`: Emphasized text.
- `<program project="vlpp" language="C++">`: Code block. It requires `<code><![CDATA[...]]></code>` and may include `<output><![CDATA[...]]></output>`.

Any other element is rejected unless the caller supplied a `pluginParser` that returns a `Plugin`.

## Link Rendering

Rendering rewrites links with these rules:

- Links beginning with `//` lose one leading slash and are treated as site-root links without `hrefPrefix`.
- Links beginning with `/` receive `hrefPrefix` when one is supplied.
- Links beginning with `.` or `/` open in the same page.
- Other links open with `target="_blank"`.

## Plugin Lifecycle

Plugin elements are meant to be parsed by content packages and then consumed before rendering:

```ts
const article = parseArticle(xml, parseArticlePlugin);
consumePlugin(article, renderArticlePlugin);
const html = renderArticle(article);
```

`website-doc2` uses this for `<sample>` and `<control-templates>`. `article-document` uses the same mechanism for `<symbol>` and `<symbols>` inside generated API documentation.
