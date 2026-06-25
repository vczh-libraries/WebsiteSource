# mvc

Package folder: `packages/mvc`

Package name: `gaclib-mvc`

This package provides a small typed URL router. Content packages use it to register page and asset routes, and `spider` uses the registered static patterns to discover files for publishing.

## Public API

- `route`: Tagged template function that creates a `RouterPattern`.
- `createRouter<TResult>(pathPrefix?)`: Creates a router. `pathPrefix` must be present at the beginning of every matched query when supplied.
- `endsWithPatternArray(rp)`: Returns true when the route's last fragment is a trailing array parameter.
- Types: `Router`, `RouterPattern`, `RouterCallback`, `RouterParameterPack`, `HttpMethods`, and the fragment/parameter enums used in tests and by `spider`.

## Route Template Syntax

Routes always begin with `/`.

```ts
route`/`
route`/index.html`
route`/getting_started/${{ lib: '' }}.html`
route`/tutorial/${{ tutorial: '' }}/demo/${{ title: '' }}.html`
route`/document/1.0-${{ path: [''] }}.html`
```

Parameter object values define the parameter type:

- `{{ name: '' }}`: string
- `{{ page: 0 }}`: number, accepted only when the matched text round-trips as a number
- `{{ enabled: true }}`: boolean, accepted only as `true` or `false`
- `{{ path: [''] }}`: array of strings split by `/`

An array parameter may only appear as the final route fragment. It can be free, prefixed, suffixed, or both, such as `/doc/${{ path: [''] }}.html`.

Within one path fragment, route parameters can appear between text pieces:

```ts
route`/Demo-${{ title: '' }}.html`
route`/${{ a: '' }}-${{ b: '' }}`
route`/Complex${{ a: '' }}Pattern${{ b: '' }}Example`
```

Adjacent parameters require non-empty text between them.

## Router Behavior

`router.register(methods, pattern, callback)` registers a route. An empty `methods` array means `GET`.

`router.match(method, query)` strips `pathPrefix`, validates that the remaining query starts with `/`, and tries every matching method route. A callback may return `undefined` to decline a match after parameters are parsed. If more than one callback returns a result for the same query, `match` throws an ambiguity error.

The generated model starts with default values for all parameters, then receives parsed values from the URL.
