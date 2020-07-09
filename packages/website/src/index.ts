import { readFileSync } from 'fs';
import { Article, parseArticle } from 'gaclib-article';
import { createMvcServer, hostUntilPressingEnter, litHtmlViewCallback, litHtmlViewRouterCallback, registerFolder, untilPressEnter, ViewConfig } from 'gaclib-host';
import { createRouter, HttpMethods, route } from 'gaclib-mvc';
import { collectStaticUrls, downloadWebsite } from 'gaclib-spider';
import * as path from 'path';
import { views } from './views';

function loadArticle(filename: string): Article {
    const xml = readFileSync(path.join(__dirname, `../src/articles/${filename}`), { encoding: 'utf-8' });
    return parseArticle(xml);
}

const router = createRouter<[string, string | Buffer]>();
registerFolder(router, path.join(__dirname, `./dist`));

const topLevelPages: { [key: string]: { title: string; button: string; article: string } } = {
    tutorial: {
        title: 'Tutorial',
        button: 'Tutorial',
        article: 'tutorial.xml'
    },
    demo: {
        title: 'Demos',
        button: 'Demo',
        article: 'demo.xml'
    },
    download: {
        title: 'Download',
        button: 'Download',
        article: 'download.xml'
    },
    document: {
        title: 'Document',
        button: 'Document',
        article: 'document.xml'
    },
    contact: {
        title: 'Contact',
        button: 'Contact',
        article: 'contact.xml'
    }
};

interface TopLevelPageModel {
    page: string;
}

const homtPageConfig: ViewConfig = {
    info: { title: 'Gaclib -- GPU Accelerated C++ User Interface (vczh)' },
    embeddedResources: {
        activeButton: 'Home',
        article: loadArticle('home.xml')
    }
};

router.register([], route`/`, litHtmlViewCallback(views, 'Gaclib-ArticleView', homtPageConfig));
router.register([], route`/index.html`, litHtmlViewCallback(views, 'Gaclib-ArticleView', homtPageConfig));

router.register(
    [],
    route`/${{ page: '' }}.html`,
    (method: HttpMethods, model: TopLevelPageModel): [string, string] | undefined => {
        const page = topLevelPages[model.page];
        if (page === undefined) {
            return undefined;
        }
        return litHtmlViewRouterCallback(
            method,
            model,
            views,
            'Gaclib-ArticleView',
            {
                info: { title: `Gaclib -- ${page.title}` },
                embeddedResources: {
                    activeButton: page.button,
                    article: loadArticle(page.article)
                }
            }
        );
    }
);

console.log(JSON.stringify(process.argv, undefined, 4));
const server = createMvcServer(router);

if (process.argv[2] === '-d') {
    server.listen(8080, 'localhost');

    const topLevelPageUrls = Object.keys(topLevelPages).map((name: string) => `/${name}.html`);
    downloadWebsite(collectStaticUrls(router).concat(topLevelPageUrls), path.join(__dirname, './website'));
    untilPressEnter();
} else {
    hostUntilPressingEnter(server, 8080);
}
