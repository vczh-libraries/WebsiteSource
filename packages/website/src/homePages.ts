import { litHtmlViewCallback, litHtmlViewRouterCallback, MvcRouter, MvcRouterResult, ViewConfig } from 'gaclib-host';
import { HttpMethods, route } from 'gaclib-mvc';
import { loadArticle } from './topLevelPages';
import { views } from './views';

const homePageConfig: ViewConfig = {
    info: { title: 'Gaclib -- GPU Accelerated C++ User Interface (vczh)' },
    embeddedResources: {
        activeButton: 'Home',
        activeCategory: 'Hello',
        homeArticle: loadArticle('home.xml'),
        categoryArticle: loadArticle('home/hello.xml')
    }
};

const categoryPages: { [key: string]: { category: string; article: string } } = {
    gacui: {
        category: 'GacUI',
        article: 'home/gacui.xml'
    },
    'data-processing': {
        category: 'Data',
        article: 'home/data-processing.xml'
    },
    'string-processing': {
        category: 'String',
        article: 'home/string-processing.xml'
    },
    'reflection-scripting': {
        category: 'Scripting',
        article: 'home/reflection-scripting.xml'
    }
};

interface CategoryPageModel {
    page: string;
}

export const homePageDynamicUrls: string[] = Object.keys(categoryPages).map((name: string) => `/home/${name}.html`);

export function registerHomePages(router: MvcRouter): void {
    router.register([], route`/`, litHtmlViewCallback(views, 'Gaclib-HomeCategoryView', homePageConfig));
    router.register([], route`/index.html`, litHtmlViewCallback(views, 'Gaclib-HomeCategoryView', homePageConfig));

    router.register(
        [],
        route`/home/${{ page: '' }}.html`,
        (method: HttpMethods, model: CategoryPageModel): MvcRouterResult | undefined => {
            const page = categoryPages[model.page];
            if (page === undefined) {
                return undefined;
            }
            return litHtmlViewRouterCallback(
                method,
                model,
                views,
                'Gaclib-HomeCategoryView',
                {
                    info: { title: 'Gaclib -- GPU Accelerated C++ User Interface (vczh)' },
                    embeddedResources: {
                        activeButton: 'Home',
                        activeCategory: page.category,
                        homeArticle: loadArticle('home.xml'),
                        categoryArticle: loadArticle(page.article)
                    }
                }
            );
        }
    );
}
