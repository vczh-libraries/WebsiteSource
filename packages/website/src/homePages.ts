import { Article, Image, Paragraph, Topic } from 'gaclib-article';
import { litHtmlViewCallback, litHtmlViewRouterCallback, MvcRouter, MvcRouterResult, ViewConfig } from 'gaclib-host';
import { HttpMethods, route } from 'gaclib-mvc';
import { loadArticle } from './topLevelPages';
import { views } from './views';
import { FeatureItem, FeatureList } from './views/homeCategoryFeatureView';

function getFeatureListFromArticle(article: Article): FeatureList {
    return {
        title: article.topic.title,
        features: (<Topic[]>article.topic.content.slice(1)).map((t: Topic, index: number): FeatureItem => {
            const image = (<Image>(<Paragraph>article.topic.content[0]).content[index]);
            return {
                image: image.src,
                href: <string>image.caption,
                article: { index: false, numberBeforeTitle: false, topic: t }
            };
        })
    };
}

const homePageConfig: ViewConfig = {
    info: { title: 'Gaclib -- GPU Accelerated C++ User Interface (vczh)' },
    embeddedResources: {
        activeButton: 'Home',
        activeCategory: 'Hello',
        homeArticle: loadArticle('home.xml'),
        categoryArticle: loadArticle('home/hello.xml')
    }
};

const categoryArticlePages: { [key: string]: { category: string; article: Article } } = {
    'data-processing': {
        category: 'Data',
        article: loadArticle('home/data-processing.xml')
    },
    'string-processing': {
        category: 'String',
        article: loadArticle('home/string-processing.xml')
    },
    'reflection-scripting': {
        category: 'Scripting',
        article: loadArticle('home/reflection-scripting.xml')
    }
};

const categoryFeaturePages: { [key: string]: { category: string; featureList: FeatureList } } = {
    gacui: {
        category: 'GacUI',
        featureList: getFeatureListFromArticle(loadArticle('home/gacui.xml'))
    }
};

interface CategoryPageModel {
    page: string;
}

const categoryArticleUrls = Object.keys(categoryArticlePages).map((name: string) => `/home/${name}.html`);
const categoryFeatureUrls = Object.keys(categoryFeaturePages).map((name: string) => `/home/${name}.html`);
export const homePageDynamicUrls = categoryArticleUrls.concat(categoryFeatureUrls);

const homeArticle = loadArticle('home.xml');

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

            return litHtmlViewRouterCallback(
                method,
                model,
                views,
                'Gaclib-HomeCategoryArticleView',
                {
                    info: { title: `Gaclib -- Home -- ${page.article.topic.title}` },
                    embeddedResources: {
                        activeButton: 'Home',
                        activeCategory: page.category,
                        homeArticle: homeArticle,
                        categoryArticle: page.article
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

            return litHtmlViewRouterCallback(
                method,
                model,
                views,
                'Gaclib-HomeCategoryFeatureView',
                {
                    info: { title: `Gaclib -- Home -- ${page.featureList.title}` },
                    embeddedResources: {
                        activeButton: 'Home',
                        activeCategory: page.category,
                        homeArticle: homeArticle,
                        featureList: page.featureList
                    }
                }
            );
        }
    );
}
