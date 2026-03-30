// tslint:disable:no-http-string

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as http from 'http';
import * as path from 'path';
import { Router, RouterFragment, RouterFragmentKind, RouterPatternBase } from 'gaclib-mvc';

export function collectStaticUrls<TResult>(router: Router<TResult>): string[] {
    return router
        .registered
        .filter((value: RouterPatternBase) => {
            return value
                .fragments
                .map((fragment: RouterFragment) => fragment.kind === RouterFragmentKind.Text)
                .reduce((a: boolean, b: boolean) => a && b)
                ;
        })
        .map((value: RouterPatternBase) => {
            return value
                .fragments
                .map((fragment: RouterFragment) => {
                    return fragment.kind === RouterFragmentKind.Text ? fragment.text : '';
                })
                .join('/')
                ;
        })
        .filter((url: string) => url !== '')
        .map((url: string) => `${router.pathPrefix}/${url}`)
        ;
}

function httpGet(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode} for ${url}`));
                res.resume();
                return;
            }
            const chunks: Buffer[] = [];
            res.on('data', (chunk: Buffer) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

export async function downloadWebsite(urls: string[], directory: string): Promise<void> {
    for (const urlPath of urls) {
        const fullUrl = `http://localhost:8080${urlPath}`;
        try {
            const data = await httpGet(fullUrl);
            const filePath = path.join(directory, urlPath);
            const dir = path.dirname(filePath);
            if (!existsSync(dir)) {
                mkdirSync(dir, { recursive: true });
            }
            writeFileSync(filePath, data);
            console.log(`${fullUrl} => ${urlPath}`);
        } catch (err) {
            console.error(`Failed: ${fullUrl} - ${(<Error>err).message}`);
        }
    }
}
