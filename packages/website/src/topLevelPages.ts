import { readFileSync } from 'fs';
import { Article, parseArticle } from 'gaclib-article';
import { litHtmlViewRouterCallback, MvcRouter, MvcRouterResult } from 'gaclib-host';
import { HttpMethods, route } from 'gaclib-mvc';
import * as path from 'path';
import { views } from './views';

export function loadArticle(filename: string): Article {
    const xml = readFileSync(path.join(__dirname, `../src/articles/${filename}`), { encoding: 'utf-8' });
    return parseArticle(xml);
}

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

export const topLevelPageDynamicUrls = Object.keys(topLevelPages).map((name: string) => `/${name}.html`);

export function registerTopLevelPages(router: MvcRouter): void {
    router.register(
        [],
        route`/${{ page: '' }}.html`,
        (method: HttpMethods, model: TopLevelPageModel): MvcRouterResult | undefined => {
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
}
