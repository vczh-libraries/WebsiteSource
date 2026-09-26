# vczh-libraries.github.io

## Project Structures

All packages are in the `packages` folder

- [article](./docs/article.md): shared XML article parser, plugin hook, and `lit-html` renderer used by website content.
- [article-document](./docs/article-document.md): API document XML parser that converts generated reference XML into article trees.
- [eslint-shared](./docs/eslint-shared.md): shared ESLint configuration package for all TypeScript packages.
- [host](./docs/host.md): Node HTTP host that connects the router, static files, and generated view HTML.
- [mvc](./docs/mvc.md): URL router and typed route-template DSL used by the host and content packages.
- [render](./docs/render.md): browser-side view metadata, HTML shell generation, resource embedding, and nested view orchestration.
- [render-esbuild](./docs/render-esbuild.md): esbuild bundler for browser-side view modules.
- [spider](./docs/spider.md): static URL collector and downloader used by publishing commands.
- [website](./docs/website.md): file structure and content routes for the main website.
- [website-doc2](./docs/website-doc.md): file structure, document tree, custom templates, and content routes for GacUI 2.0 documents (latest).
- obsolete documents:
  - `website-doc1`: document pages for GacUI 1.0
  - these packages are frozen, no editing should be allowed unless it can't build.
  - all document packages share the same architecture.

## Building

```
yarn install
yarn build
```

## Testing

- `yarn test` should pass.
- `npm run download` should not crash in `website`.
- `npm run download` and `npm run markdown` should not crash in `website-doc2`.

## Debugging

The site is split into 2 parts: `website` and `website-doc2`.
Run `npm run start` in `website` hosts the main site.
Run `npm run start` in `website-doc2` hosts the document part of the site.
The above commands start an interactive CLI application, running an HTTP service.
The website content is interpreted and rendered at browser side.
The HTTP service only hosts metadata, scripts and skeleton HTML files.
`playwright` is required to actually read the content.

When running `website`, most links in the `document` page does not work, unless `website-doc2` is also running.
They are not required to run at the same time if you don't need both.

## Publishing

Checkout [job.publish.prompt.md](./job.publish.prompt.md) for details.

## Maintenance

Package documents in `docs` are maintainer and coding-agent guidance. Write them to explain what a package does, which public APIs or content formats matter, and how the package fits into the website pipeline. They should be informative, precise, and short. Prefer direct descriptions over tutorial prose, and avoid duplicating source code details that are obvious from the implementation.

Create one document per package using the package folder name: `docs/<package-folder-name>.md`. Start with the package folder, npm package name, and a short purpose statement. Then describe only the parts a maintainer needs to use or change the package safely: file structure, public entry points, route or parser contracts, custom template syntax, build/start/download behavior, and known limitations.

The website content packages are special:
- `website` is the main site content package; use `docs/website.md` for its file organization and route model.
- `website-doc2` is the latest documentation content package; use `docs/website-doc.md` for the reference tree, nested categories, custom templates, route model, and markdown export.
- Shared article syntax belongs in `docs/article.md`; generated API document syntax belongs in `docs/article-document.md`.

Do not repeat those structures in every package document. Link to the relevant document and add only package-specific behavior.

Use this project-to-repo mapping when writing or updating website documents:
- Vlpp documentation maps to the `Vlpp` repo.
- VlppOS documentation maps to the `VlppOS` repo.
- VlppRegex documentation maps to the `VlppRegex` repo.
- VlppReflection documentation maps to the `VlppReflection` repo.
- VlppParser2 documentation maps to the `VlppParser2` repo.
- Workflow documentation maps to the `Workflow` repo.
- GacUI documentation maps to the `GacUI` repo.
- Example and release assets may point to the `Release` repo.
- Published markdown and the coding-agent knowledge base are consumed by the `Tools` repo.

When documenting invented templates or parsers, give the grammar shape, allowed attributes, nesting rules, and one compact example. Explain what the parser produces and where the rendered result is consumed. Do not write a full textbook for library users; the exported knowledge base and source repos are responsible for detailed coding guidance.

## Writing Documents for the Library

Library document pages are written for library users, maintainers, and coding agents. Their job is to explain the concepts, syntax, APIs, and rules that help someone use the libraries correctly. They are guidance pages, not textbooks and not generated API references.

Write in English with direct and precise sentences. Prefer stable facts, constraints, and examples over broad claims. Use exact project names, class names, function names, XML tags, attributes, commands, and repository names. Keep paragraphs short, and remove wording that only says something is useful without explaining when or why.

Organize content by project and by user task. A page should have a narrow purpose: what the feature is, when to use it, the required syntax or API surface, important options, common mistakes, and links to related pages or generated reference pages. Keep exhaustive member lists in generated API documents; hand-written pages should connect concepts and point readers to the exact names they need.

Follow `docs/website-doc.md` for where pages live, how `reference.xml` and `entry.xml` organize categories, and which custom templates are available. Follow `docs/article.md` for shared article syntax and `docs/article-document.md` for generated API document syntax. Do not duplicate those formats here.

When writing about an invented language, XML template, parser, or routing rule, include the grammar shape, allowed attributes or operands, nesting rules, and one compact valid example. Explain what the parser produces and which renderer or package consumes the result.

Examples should be small and purposeful. Prefer one example that demonstrates a rule over many examples that only vary names. If screenshots, samples, or links to the `Release` repo explain behavior better than prose, use the existing `<sample>` support described in `docs/website-doc.md`.

Before publishing, check that links point to real pages and that the page still makes sense after markdown export. The generated markdown is consumed by the `Tools` knowledge base, so avoid browser-only wording when a plain markdown reader would lose important context.

### Adding/Updating a Topic

- Figure out the correct repo and document project to add documents for that topic.
  - Each document project describes things in the same repo.
- Check out the source code, test cases and knowledge bases around the topic.
  - The knowledge base is copied to all sibling source repos so searching could be done inside that repo.
- Check out how documents are written in that project.
  - Some document project mentions things like an index.
  - Some document project offers more details.
  - There is no hard restriction about how to organize the topic, it could be added to a page, creating or updating multiple pages.
  - Follow the written style in that document project.
- Build, test and debug.
- No publishing is required.

## Home Page

Although the whole website is organized as a browser-side template engine, but the `index.html` is manually maintained.
It is located in `packages/website/assets/index.html` in a MVC structure:
- Content comes from `index.json`.
- All resources exclusively used by this page should be put in the `homeres` sub folder:
  - Styles come from `index.js` and `index/css`.
  - Screenshots come from `GacUI`, `wGac`, `iGac` and `GacJS` folders, they can be updated by calling [Copy-HomeScreenshots.ps1](./packages/website/scripts/Copy-HomeScreenshots.ps1).
  - Screenshots of XML samples should be captured with a real GacUI test app, see [README.md](./packages/website/assets/homeres/samples/README.md)
