import { readFileSync } from 'fs';
import { Article, parseArticle } from 'gaclib-article';
import { createMvcServer, hostUntilPressingEnter, litHtmlViewCallback, registerFolder, untilPressEnter } from 'gaclib-host';
import { createRouter, route, RouterFragment, RouterFragmentKind, RouterPatternBase } from 'gaclib-mvc';
import * as path from 'path';
import { downloadWebsite } from './spider';
import { views } from './views';

const pathPrefix = `/doc/current`;

function loadArticle(filename: string): Article {
    const xml = readFileSync(path.join(__dirname, `../src/articles/${filename}`), { encoding: 'utf-8' });
    return parseArticle(xml);
}

const router = createRouter<[string, string | Buffer]>(pathPrefix);
registerFolder(router, path.join(__dirname, `./dist`));

router.register(
    [],
    route`/index.html`,
    litHtmlViewCallback(
        views,
        'Gaclib-ArticleView',
        {
            info: { pathPrefix, title: 'Gaclib Document -- GPU Accelerated C++ User Interface (vczh)' },
            embeddedResources: {
                article: loadArticle('home.xml')
            }
        }
    )
);

console.log(JSON.stringify(process.argv, undefined, 4));
const server = createMvcServer(router);

if (process.argv[2] === '-d') {
    const staticUrls = router
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
        ;

    server.listen(8080, 'localhost');
    downloadWebsite(staticUrls);
    untilPressEnter();
} else {
    hostUntilPressingEnter(server, 8080);
}
