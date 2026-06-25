# vczh-libraries.github.io

## Project Structures

All packages are in the `packages` folder

<!-- complete the list -->
- [website](./docs/website.md): web pages of the site
- [website-doc2](./doc/website-doc.md): document pages for GacUI 2.0 (latest)
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

The side is splitted into 2 part: `website` and `website-doc2`.
Run `npm run start` in `website` hosts the main site.
Run `npm run start` in `website-doc2` hosts the document part of the site.
The above commands starts an interactive CLI application, running an HTTP service.
The website content is interpreted and rendered at browser side.
The HTTP service only hosts metadata, scripts and skeleton HTML files.
`playwright` is required to actually read the content.

When running `website`, most links in the `document` page does not work, unless `website-doc2` is also running.
They are not required to run at the same time if you don't need both.

## Publishing

Run `npm run download` in `website` makes `packages/website/lib/website`
Run `npm run download` in `website-doc2` makes `packages/website-doc2/lib/website`
Run `npm run markdown` in `website-doc2` makes `packages/website-doc2/lib/markdown`

These commands download the whole website to the dist, making it a static website to be able to hosted by github io.
It also converted the latest GacUI document to markdown files so that they can be shipped in source repos.
After executing these commands, the following things must be done in the declaration order.

### 1. Publish Website

This step requires these repos to exist as sibling folders:
- vczh-libraries.github.io

Copy `packages/website/lib/website` to `./vczh-libraries.github.io` and override all existing files.
Delete `./vczh-libraries.github.io/doc/current` folder completely.
Copy all files from `packages/website-doc2/lib/website` to `./vczh-libraries.github.io/doc/current` recursively.

Commit and push all local changes in `vczh-libraries.github.io` to its `master` branch.
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

Execute `./Tools/Jobs/job.monorepo.copilotInitAll.prompt.md` first.

#### Step 2.

Delete `./Tools/Copilot/KnowledgeBase/manual` completely.
Copy all files from `packages/website-doc2/lib/markdown/manual` to `./Tools/Copilot/KnowledgeBase/manual`.
Replace `# Copy of Online Manual` in `./Tools/Copilot/KnowledgeBase/Index.md` with `packages/website-doc2/lib/markdown/index.md` (this file has the title too).

#### Step 3.

Execute `./Tools/Jobs/job.monorepo.copilotInitAll.prompt.md` again but skip learning.

#### Step 4.

Commit and push all changes in required repos to their master branches.
