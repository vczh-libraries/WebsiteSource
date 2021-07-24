# WebsiteSource

Play with nodejs

## Building

- Download [npm with nodejs](https://www.npmjs.com/get-npm)
- Download [yarn](https://yarnpkg.com/lang/en/)
- Run following commands in cmd
  - I don't know why Powershell cannot find `npm` and `yarn`.

```plaintext
yarn
yarn build
yarn test
```

## packages folder

Try building `http://gaclib.net` in a new way.

### mvc

Gaclib Website MVC url router library.

### render

Gaclib Website front-end rendering using lit-html.

### host

Gaclib Website http server.

### article

Gaclib article XML to HTML converter.

### article-document

Gaclib document XML to article XML converter.

### spider

Gaclib Website Spider

### website

Gaclib Website content: http://gaclib.net.

inside the package folder:

- **Debug**: Open `http://localhost:8080/index.html` after running `npm run start`.
- **Release**: Run `npm run download` to generate the whole website statically in `./lib/website`.

### website-doc1

Gaclib Website Document for GacUI 1.0: http://gaclib.net/doc/current/home.html.

inside the package folder:

- **Debug**: Open `http://localhost:8080/doc/current/home.html` after running `npm run start`.
- **Release**: Run `npm run download` to generate the whole website statically in `./lib/website`.

## Developer Notes:

Update multiple platform supporting information in:

- packages\website-doc1\src\articles\home.xml
- packages\website-doc1\src\articles\home\download.xml
- packages\website-doc1\src\articles\gacui\running.xml
- packages\website-doc1\src\articles\gacui\kb\application.xml
- packages\website-doc1\src\articles\gacui\kb\osprovider.xml
