// tslint:disable:no-http-string

import { Router, RouterFragment, RouterFragmentKind, RouterPatternBase } from 'gaclib-mvc';
import scrape = require('website-scraper');

type RegisterAction = (
    action: 'generateFilename',
    callback: (value: { resource: scrape.Resource }) => { filename: string }
) => void;

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

export function downloadWebsite(urls: string[], directory: string): void {

    const options = {
        urls: urls.map((url: string) => `http://127.0.0.1:8080${url}`),
        directory,
        // filenameGenerator: 'bySiteStructure',
        recursive: true,
        plugins: [{
            apply(registerAction: RegisterAction): void {
                registerAction('generateFilename', (value: { resource: scrape.Resource }) => {
                    const matches = /^http:\/\/[^\/]+(.*)$/g.exec(value.resource.url);
                    if (matches !== null) {
                        return { filename: matches[1] };
                    } else {
                        throw new Error(`Unable to process url: ${value.resource.url}`);
                    }
                });
            }
        }]
    };

    scrape(options).then(
        (value: scrape.Resource[]) => {
            for (const res of value) {
                console.log(`${res.url} => ${res.filename}`);
            }
        },
        (err: Error) => { console.log(err.message); }
    );
}
