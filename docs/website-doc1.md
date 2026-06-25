# website-doc1

Package folder: `packages/website-doc1`

Package name: `gaclib-website-doc1`

This package contains the obsolete GacUI 1.0 document site. It shares the same architecture as `website-doc2`: a reference tree, document-specific views, article XML, API document XML, and control-template plugins.

## Maintenance Rule

This package is frozen. Do not edit its content or architecture unless it cannot build and the fix is required to keep the workspace healthy.

When behavior needs to be understood, use `docs/website-doc.md` as the architecture reference and then compare the corresponding file in `packages/website-doc1`.

## Differences From website-doc2

- It targets the older GacUI 1.0 documentation content.
- It does not have a `markdown` npm script.
- Its source tree and plugins are older copies of the same document-site architecture.

## Build And Debug

- `npm run build`: Builds the frozen document package.
- `npm run start`: Hosts the package locally.
- `npm run download`: Downloads the static site output.

Only run these commands when a build or publishing task explicitly needs this frozen package.
