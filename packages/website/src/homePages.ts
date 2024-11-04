import { Article, Image, Paragraph, Topic } from 'gaclib-article';
import { litHtmlViewCallback, litHtmlViewRouterCallback, MvcRouter, MvcRouterResult, ViewConfig } from 'gaclib-host';
import { HttpMethods, route } from 'gaclib-mvc';
import { loadArticle } from './topLevelPages.js';
import { views } from './views/index.js';
import { FeatureItem, FeatureList } from './views/homeCategoryFeatureView.js';

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
    // GacUI!
    'gacui/rich': {
        category: 'GacUI',
        article: loadArticle('home/gacui/rich.xml')
    },
    'gacui/localization': {
        category: 'GacUI',
        article: loadArticle('home/gacui/localization.xml')
    },
    'gacui/styling': {
        category: 'GacUI',
        article: loadArticle('home/gacui/styling.xml')
    },
    'gacui/mvvm': {
        category: 'GacUI',
        article: loadArticle('home/gacui/mvvm.xml')
    },
    // Data
    'data-processing/containers': {
        category: 'Data',
        article: loadArticle('home/data-processing/containers.xml')
    },
    'data-processing/linq': {
        category: 'Data',
        article: loadArticle('home/data-processing/linq.xml')
    },
    'data-processing/filesystem': {
        category: 'Data',
        article: loadArticle('home/data-processing/filesystem.xml')
    },
    'data-processing/http': {
        category: 'Data',
        article: loadArticle('home/data-processing/http.xml')
    },
    'data-processing/threading': {
        category: 'Data',
        article: loadArticle('home/data-processing/threading.xml')
    },
    // Text
    'string-processing/regex': {
        category: 'String',
        article: loadArticle('home/string-processing/regex.xml')
    },
    'string-processing/lexer-cf': {
        category: 'String',
        article: loadArticle('home/string-processing/lexer-cf.xml')
    },
    'string-processing/lexer-cs': {
        category: 'String',
        article: loadArticle('home/string-processing/lexer-cs.xml')
    },
    'string-processing/parser': {
        category: 'String',
        article: loadArticle('home/string-processing/parser.xml')
    },
    // Scripting
    'reflection-scripting/registration': {
        category: 'Scripting',
        article: loadArticle('home/reflection-scripting/registration.xml')
    },
    'reflection-scripting/invoking': {
        category: 'Scripting',
        article: loadArticle('home/reflection-scripting/invoking.xml')
    },
    'reflection-scripting/scripting': {
        category: 'Scripting',
        article: loadArticle('home/reflection-scripting/scripting.xml')
    },
    'reflection-scripting/executing': {
        category: 'Scripting',
        article: loadArticle('home/reflection-scripting/executing.xml')
    },
    'reflection-scripting/codegen': {
        category: 'Scripting',
        article: loadArticle('home/reflection-scripting/codegen.xml')
    },
    // Showcase
    showcase: {
        category: 'Showcase',
        article: loadArticle('home/showcase.xml')
    }
};

const categoryFeaturePages: { [key: string]: { category: string; featureList: FeatureList } } = {
    gacui: {
        category: 'GacUI',
        featureList: getFeatureListFromArticle(loadArticle('home/gacui.xml'))
    },
    'data-processing': {
        category: 'Data',
        featureList: getFeatureListFromArticle(loadArticle('home/data-processing.xml'))
    },
    'string-processing': {
        category: 'String',
        featureList: getFeatureListFromArticle(loadArticle('home/string-processing.xml'))
    },
    'reflection-scripting': {
        category: 'Scripting',
        featureList: getFeatureListFromArticle(loadArticle('home/reflection-scripting.xml'))
    }
};

interface ArticlePageModel {
    path: string[];
}

interface FeaturePageModel {
    path: string;
}

const categoryArticleUrls = Object.keys(categoryArticlePages).map((name: string) => `/home/${name}.html`);
const categoryFeatureUrls = Object.keys(categoryFeaturePages).map((name: string) => `/home/${name}.html`);
export const homePageDynamicUrls = categoryArticleUrls.concat(categoryFeatureUrls);

const homeArticle = loadArticle('home.xml');

export function registerHomePages(router: MvcRouter): void {
    // router.register([], route`/`, litHtmlViewCallback(views, 'Gaclib-HomeCategoryArticleView', homePageConfig));
    router.register([], route`/home/index.html`, litHtmlViewCallback(views, 'Gaclib-HomeCategoryArticleView', homePageConfig));

    router.register(
        [],
        route`/home/${{ path: [''] }}.html`,
        (method: HttpMethods, model: ArticlePageModel): MvcRouterResult | undefined => {
            const page = categoryArticlePages[model.path.join('/')];
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
        route`/home/${{ path: '' }}.html`,
        (method: HttpMethods, model: FeaturePageModel): MvcRouterResult | undefined => {
            const page = categoryFeaturePages[model.path];
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
