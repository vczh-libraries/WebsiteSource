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

Run all paths below from the `WebsiteSource` repo root unless a step says to work in another repo.

Run these commands one after another because the download commands both bind port 8080:
- Run `npm run download` in `website` makes `packages/website/lib/website`
- Run `npm run download` in `website-doc2` makes `packages/website-doc2/lib/website`
- Run `npm run markdown` in `website-doc2` makes `packages/website-doc2/lib/markdown`

These commands download the whole website to the dist, making it a static website that can be hosted by github io.
They also convert the latest GacUI document to markdown files so that they can be shipped in source repos.
Publishing output should be stable. If a no-op website publish shows only `\n` to `\r\n` changes inside generated HTML JSON strings in `../vczh-libraries.github.io`, do not commit it; restore those files or regenerate from a checkout with matching line-ending settings.
After executing these commands, the following things must be done in the declaration order.

### 1. Publish Website

This step requires these repos to exist as sibling folders:
- vczh-libraries.github.io

Copy all files from `packages/website/lib/website` to `../vczh-libraries.github.io` recursively and override all existing files.
Delete `../vczh-libraries.github.io/doc/current` folder completely.
Copy all files from `packages/website-doc2/lib/website/doc/current` to `../vczh-libraries.github.io/doc/current` recursively.

Commit and push all local changes in `../vczh-libraries.github.io` to its `master` branch.
Wait for the CI to run, the repo URL is `https://github.com/vczh-libraries/vczh-libraries.github.io`.
Open `https://vczh-libraries.github.io/` and make sure it has the latest content.

### 2. Publish Markdown Documents

This step requires these repos to exist as sibling folders:
- Tools
- Vlpp
- VlppOS
- VlppRegex
- VlppReflection
- VlppParser2
- Workflow
- GacUI
- Release

#### Step 1.

Follow the prompt in `../Tools/Jobs/job.monorepo.copilotInitAll.prompt.md` first.

#### Step 2.

Delete `../Tools/Copilot/KnowledgeBase/manual` completely.
Copy all files from `packages/website-doc2/lib/markdown/manual` to `../Tools/Copilot/KnowledgeBase/manual`.
Replace the whole `# Copy of Online Manual` section in `../Tools/Copilot/KnowledgeBase/Index.md` with `packages/website-doc2/lib/markdown/index.md` (this file has the title too). This section is the final section of the file, so replace from that heading to the end of the file.

#### Step 3.

Follow the prompt in `../Tools/Jobs/job.monorepo.copilotInitAll.prompt.md` again but skip learning.

#### Step 4.

Commit and push all changes in required repos to their master branches.
