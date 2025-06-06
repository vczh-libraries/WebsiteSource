import { readdirSync, readFileSync, statSync } from 'fs';
import { HttpMethods, route, Router, RouterCallback } from 'gaclib-mvc';
import { EmbeddedResources, generateHtml, HtmlInfo, ViewMetadata } from 'gaclib-render';
import * as http from 'http';
import * as mime from 'mime-types';
import * as path from 'path';
import * as url from 'url';

export type MvcRouterResult = [string, string | Buffer];
export type MvcRouter = Router<MvcRouterResult>;

export interface ViewConfig {
    info?: HtmlInfo;
    extraHeadHtml?: string;
    embeddedResources?: EmbeddedResources;
}

export function litHtmlViewRouterCallback<TModel extends {} = {}>(
    method: HttpMethods,
    model: TModel,
    views: ViewMetadata[],
    viewName: string,
    config: ViewConfig
): MvcRouterResult {
    const info = config.info !== undefined ? config.info : {};
    const head = config.extraHeadHtml !== undefined ? config.extraHeadHtml : '';
    const res = config.embeddedResources !== undefined ? config.embeddedResources : {};

    const generatedHtml = generateHtml(
        info,
        views,
        viewName,
        model,
        head,
        res
    );
    return ['text/html', generatedHtml];
}

export function litHtmlViewCallback<TModel extends {} = {}>(
    views: ViewMetadata[],
    viewName: string,
    config: ViewConfig
): RouterCallback<TModel, MvcRouterResult> {
    return (method: HttpMethods, model: TModel): MvcRouterResult => {
        return litHtmlViewRouterCallback<TModel>(method, model, views, viewName, config);
    };
}

export function fileCallback(type: string, filename: string): RouterCallback<{}, MvcRouterResult> {
    const buffer = readFileSync(filename);
    return (): [string, Buffer] => [type, buffer];
}

export function registerFile(router: MvcRouter, type: string, resourcePath: string, dir: string): void {
    if (resourcePath.length === 0 || resourcePath[0] !== '/') {
        throw new Error('Path should begin with "/".');
    }

    const tsa: TemplateStringsArray = Object.assign([resourcePath], { raw: [resourcePath] });
    router.register([], route(tsa), fileCallback(type, path.join(dir, `.${resourcePath}`)));
}

export function registerFolder(router: MvcRouter, distFolder: string, prefix: string = '/'): void {
    const currentFolder = path.join(distFolder, prefix.substr(1));
    for (const filename of readdirSync(currentFolder)) {
        const childFolder = path.join(currentFolder, filename);
        if (statSync(childFolder).isDirectory()) {
            registerFolder(router, distFolder, `${prefix}${filename}/`);
        } else {
            const urlPath = `${prefix}${filename}`;
            const mimeType = mime.lookup(urlPath);
            if (mimeType !== false) {
                registerFile(router, mimeType, urlPath, distFolder);
            }
        }
    }
}

export function createMvcServer(router: MvcRouter): http.Server {
    return http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
        NOT_FOUND: {
            if (req.method === undefined || req.url === undefined) {
                break NOT_FOUND;
            }

            const query = url.parse(req.url, true);
            if (query.pathname === undefined || query.pathname === null) {
                break NOT_FOUND;
            }

            const htmlResult = router.match(<HttpMethods>req.method, query.pathname);
            if (htmlResult === undefined) {
                break NOT_FOUND;
            }

            if (typeof htmlResult[1] === 'string') {
                res.writeHead(200, { 'Content-Type': htmlResult[0] });
                res.write(htmlResult[1]);
            } else {
                res.writeHead(200, { 'Content-Type': htmlResult[0] });
                res.write(htmlResult[1], 'binary');
            }
            res.end();
            return;
        }

        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write('Sorry, the server does not respond to your query.');
        res.end();
    });
}

export function untilPressEnter(): void {
    if (process.stdin.setRawMode !== undefined) {
        process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.on('data', () => { process.exit(0); });
}

export function hostUntilPressingEnter(server: http.Server, port: number, host: string = 'localhost'): void {
    server.listen(port, host, () => {
        console.log('Server started at port: 8080');
        console.log('Press ENTER to stop');
    });
    untilPressEnter();
}
