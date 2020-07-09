import { litHtmlViewCallback, MvcRouter, ViewConfig } from 'gaclib-host';
import { route } from 'gaclib-mvc';
import { loadArticle } from './topLevelPages';
import { views } from './views';

const homePageConfig: ViewConfig = {
    info: { title: 'Gaclib -- GPU Accelerated C++ User Interface (vczh)' },
    embeddedResources: {
        activeButton: 'Home',
        homeArticle: loadArticle('home.xml'),
        categoryArticle: loadArticle('home/hello.xml')
    }
};

export const homePageDynamicUrls: string[] = [];

export function registerHomePages(router: MvcRouter): void {
    router.register([], route`/`, litHtmlViewCallback(views, 'Gaclib-HomeCategoryView', homePageConfig));
    router.register([], route`/index.html`, litHtmlViewCallback(views, 'Gaclib-HomeCategoryView', homePageConfig));
}
