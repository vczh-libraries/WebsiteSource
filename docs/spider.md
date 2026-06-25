# spider

Package folder: `packages/spider`

Package name: `gaclib-spider`

This package supports static publishing. It collects static routes from a router and downloads pages from the local development server into an output folder.

## Public API

- `collectStaticUrls(router)`: Returns URLs for registered router patterns made only of literal text fragments.
- `downloadWebsite(urls, directory)`: Downloads each URL from `http://localhost:8080${urlPath}` and writes it under `directory`.

## Static URL Collection

Only routes whose fragments are all `RouterFragmentKind.Text` are collected. Parameterized content routes, such as `/home/${{ path: [''] }}.html`, are not discoverable from the router alone.

Because of this, content packages append their own dynamic URL lists:

- `website` appends `homePageDynamicUrls` and `topLevelPageDynamicUrls`.
- `website-doc2` walks the loaded document tree and appends every document page path.

## Download Behavior

`downloadWebsite` creates parent directories as needed and writes response bodies as buffers. Individual URL failures are logged and the function continues with the remaining URLs.

The function currently assumes the site is already hosted on `localhost:8080`; callers are responsible for starting and stopping the server.
