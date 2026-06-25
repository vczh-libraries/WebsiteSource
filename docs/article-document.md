# article-document

Package folder: `packages/article-document`

Package name: `gaclib-article-document`

This package parses processed API reference XML into a `DocArticle`, then renders it into the shared `gaclib-article` AST. It is used by `website-doc2` for generated C++ declaration pages.

## Public API

- `parseDocArticle(xml, exampleRetriver)`: Parses one `<Document>` XML string. `<example index="N"/>` delegates to `exampleRetriver(N)`.
- `renderDocArticle(docArticle, title, docSymbolConverter)`: Converts a `DocArticle` to an `Article`. `docSymbolConverter` maps `DocSymbol` values to article links.
- `acceptableAccessors`: `''`, `public`, `protected`, `private`.
- `acceptableCategories`: `Enum`, `Class`, `Struct`, `Union`, `TypeAlias`, `Variable`, `ValueAlias`, `Namespace`, `Function`.

The exported interfaces describe the parsed document model: `DocArticle`, `DocText`, `DocExample`, `DocSymbol`, and `DocSymbolsPluginObject`.

## Document XML

The root element is `<Document>` with required attributes:

```xml
<Document accessor="public" category="Class" name="MyClass">
  <signature><![CDATA[class MyClass;]]></signature>
  <summary>Short description.</summary>
  <remarks>
    <p>Paragraph using <b>article formatting</b>.</p>
  </remarks>
  <typeparam name="T">Type parameter text.</typeparam>
  <param name="value">Function parameter text.</param>
  <returns>Return value text.</returns>
  <example><![CDATA[code]]></example>
  <basetypes>
    <symbol name="Base" docId="BaseSymbolId"/>
  </basetypes>
  <seealsos>
    <symbol name="Related" docId="RelatedSymbolId"/>
  </seealsos>
</Document>
```

`<signature>` and inline `<example>` contain only CDATA. `<example index="N"/>` loads external `.ein.N.xml` and `.eout.N.txt` files through the caller's retriever.

## Text Blocks

`<summary>`, `<remarks>`, and `<returns>` do not require a `name`. `<typeparam>`, `<param>`, and `<enumitem>` require `name`.

Each text block supports exactly one of these shapes:

- Plain text or CDATA. Non-empty lines become separate paragraphs.
- An implicit article paragraph, for example `This is a <b>book</b>.`
- Multiple explicit `<p>` children using the shared article paragraph format.

Inside document text, `<symbol name="..." docId="..."/>` and `<symbols>...</symbols>` are parsed as plugins. `renderDocArticle` resolves them with the caller-provided `DocSymbolConverter`. Multiple resolved symbols become a shared article `MultiPageLink`.

## Rendered Topic Order

`renderDocArticle` creates article topics in this order when data exists:

1. Signature
2. Summary
3. Enum Items
4. Type Parameters
5. Parameters
6. Return Value
7. Remarks
8. Example
9. Base Types
10. See Also

The result is a normal `Article`, so callers render it with the same `renderArticle` path as hand-written pages.
