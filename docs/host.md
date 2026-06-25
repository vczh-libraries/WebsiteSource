# host

Package folder: `packages/host`

Package name: `gaclib-host`

This package adapts `gaclib-mvc` routes to a Node HTTP server. It serves static files, creates HTML pages from `gaclib-render`, and provides helpers for the interactive `npm run start` commands.

## Public API

- `MvcRouterResult`: `[contentType, string | Buffer]`.
- `MvcRouter`: `Router<MvcRouterResult>`.
- `ViewConfig`: Optional `info`, `extraHeadHtml`, and `embeddedResources` passed to `generateHtml`.
- `litHtmlViewRouterCallback(method, model, views, viewName, config)`: Builds a page response by calling `generateHtml`.
- `litHtmlViewCallback(views, viewName, config)`: Wraps `litHtmlViewRouterCallback` as a `RouterCallback`.
- `fileCallback(type, filename)`: Reads a file once and returns a callback that serves it as a `Buffer`.
- `registerFile(router, type, resourcePath, dir)`: Registers one static file route. `resourcePath` must begin with `/`.
- `registerFolder(router, distFolder, prefix = '/')`: Recursively registers all files under `distFolder` using MIME types from `mime-types`.
- `createMvcServer(router)`: Creates an HTTP server that matches `req.url` pathnames against the router and returns 404 for misses.
- `untilPressEnter()` and `hostUntilPressingEnter(server, port, host?)`: Helpers for interactive local servers.

## Usage Pattern

Content packages normally create one router, register the copied asset folder, register page routes, and then either host or download the site:

```ts
const router = createRouter<MvcRouterResult>();
registerFolder(router, path.join(__dirname, './dist'));
registerTopLevelPages(router);

const server = createMvcServer(router);
hostUntilPressingEnter(server, 8080);
```

`website` and `website-doc2` use the same server for static downloads by calling `server.listen(8080, 'localhost')`, running `downloadWebsite`, then closing the server.

## Request Flow

1. The HTTP server parses `req.url` with the request host as a base URL.
2. The pathname is matched by the MVC router.
3. A successful route returns `[contentType, body]`.
4. String bodies are written as text; `Buffer` bodies are written as binary.
5. Missing routes return a plain-text 404.
