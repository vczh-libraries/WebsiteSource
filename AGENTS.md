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

Run this PowerShell from the `WebsiteSource` repo root to prepare the website repo:

```powershell
$repoRoot = (Resolve-Path .).Path
$pagesRepo = (Resolve-Path ..\vczh-libraries.github.io).Path

$mainSource = Join-Path $repoRoot "packages\website\lib\website"
$docSource = Join-Path $repoRoot "packages\website-doc2\lib\website\doc\current"
$docTarget = [System.IO.Path]::GetFullPath((Join-Path $pagesRepo "doc\current"))
$pagesRepoRoot = [System.IO.Path]::GetFullPath($pagesRepo).TrimEnd("\")

if (-not $docTarget.StartsWith($pagesRepoRoot + "\", [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Unexpected doc target: $docTarget"
}

foreach ($path in @($mainSource, $docSource, $pagesRepo)) {
    if (-not (Test-Path -LiteralPath $path)) {
        throw "Missing required path: $path"
    }
}

Copy-Item -Path (Join-Path $mainSource "*") -Destination $pagesRepo -Recurse -Force

if (Test-Path -LiteralPath $docTarget) {
    Remove-Item -LiteralPath $docTarget -Recurse -Force
}

New-Item -ItemType Directory -Path $docTarget | Out-Null
Copy-Item -Path (Join-Path $docSource "*") -Destination $docTarget -Recurse -Force
```

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
