// tslint:disable:no-http-string

import { Router, RouterFragment, RouterFragmentKind, RouterPatternBase } from 'gaclib-mvc';
import websiteScraper from 'website-scraper';

type RegisterAction = (
    action: 'generateFilename',
    callback: (value: { resource: websiteScraper.Resource }) => { filename: string }
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
        urls: urls.map((url: string) => `http://localhost:8080${url}`),
        directory,
        recursive: true,
        requestConcurrency: 1,
        plugins: [{
            apply(registerAction: RegisterAction): void {
                registerAction('generateFilename', (value: { resource: websiteScraper.Resource }) => {
                    // eslint-disable-next-line no-useless-escape
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

    websiteScraper(options).then(
        (value: websiteScraper.Resource[]) => {
            for (const res of value) {
                console.log(`${res.url} => ${res.filename}`);
            }
        },
        (err: Error) => { console.log(err.message); }
    );
}
