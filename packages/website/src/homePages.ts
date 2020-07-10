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

const categoryArticlePages: { [key: string]: { category: string; article: string } } = {
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

const categoryFeaturePages: { [key: string]: { category: string; article: string } } = {
    gacui: {
        category: 'GacUI',
        article: 'home/gacui.xml'
    }
};

interface CategoryPageModel {
    page: string;
}

const categoryArticleUrls = Object.keys(categoryArticlePages).map((name: string) => `/home/${name}.html`);
const categoryFeatureUrls = Object.keys(categoryFeaturePages).map((name: string) => `/home/${name}.html`);
export const homePageDynamicUrls = categoryArticleUrls.concat(categoryFeatureUrls);

export function registerHomePages(router: MvcRouter): void {
    router.register([], route`/`, litHtmlViewCallback(views, 'Gaclib-HomeCategoryArticleView', homePageConfig));
    router.register([], route`/index.html`, litHtmlViewCallback(views, 'Gaclib-HomeCategoryArticleView', homePageConfig));

    router.register(
        [],
        route`/home/${{ page: '' }}.html`,
        (method: HttpMethods, model: CategoryPageModel): MvcRouterResult | undefined => {
            const page = categoryArticlePages[model.page];
            if (page === undefined) {
                return undefined;
            }

            const homeArticle = loadArticle('home.xml');
            const categoryArticle = loadArticle(page.article);
            return litHtmlViewRouterCallback(
                method,
                model,
                views,
                'Gaclib-HomeCategoryArticleView',
                {
                    info: { title: `Gaclib -- Home -- ${categoryArticle.topic.title}` },
                    embeddedResources: {
                        activeButton: 'Home',
                        activeCategory: page.category,
                        homeArticle: homeArticle,
                        categoryArticle: categoryArticle
                    }
                }
            );
        }
    );

    router.register(
        [],
        route`/home/${{ page: '' }}.html`,
        (method: HttpMethods, model: CategoryPageModel): MvcRouterResult | undefined => {
            const page = categoryFeaturePages[model.page];
            if (page === undefined) {
                return undefined;
            }

            const homeArticle = loadArticle('home.xml');
            const featureArticle = loadArticle(page.article);
            return litHtmlViewRouterCallback(
                method,
                model,
                views,
                'Gaclib-HomeCategoryFeatureView',
                {
                    info: { title: `Gaclib -- Home -- ${featureArticle.topic.title}` },
                    embeddedResources: {
                        activeButton: 'Home',
                        activeCategory: page.category,
                        homeArticle: homeArticle,
                        featureArticle: featureArticle
                    }
                }
            );
        }
    );
}
