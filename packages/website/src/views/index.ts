import { ViewMetadata } from 'gaclib-render';

const rootView: ViewMetadata = {
    name: 'Gaclib-RootView',
    source: `${__dirname}/rootView.js`,
    path: '/scripts/rootView.js',
    containerId: 'rootViewContainer',
    htmlInfo: {
        shortcutIcon: '/favicon.ico',
        styleSheets: ['/global.css', '/navigation.css']
    }
};

const articleView: ViewMetadata = {
    name: 'Gaclib-ArticleView',
    source: `${__dirname}/articleView.js`,
    path: '/scripts/articleView.js',
    parentView: 'Gaclib-RootView',
    htmlInfo: {}
};

const homeView: ViewMetadata = {
    name: 'Gaclib-HomeView',
    source: `${__dirname}/homeView.js`,
    path: '/scripts/homeView.js',
    parentView: 'Gaclib-RootView',
    containerId: 'homeViewContainer',
    htmlInfo: {
        styleSheets: ['/category.css']
    }
};

const homeCategoryArticleView: ViewMetadata = {
    name: 'Gaclib-HomeCategoryArticleView',
    source: `${__dirname}/homeCategoryArticleView.js`,
    path: '/scripts/homeCategoryArticleView.js',
    parentView: 'Gaclib-HomeView',
    htmlInfo: {}
};

const homeCategoryFeatureView: ViewMetadata = {
    name: 'Gaclib-HomeCategoryFeatureView',
    source: `${__dirname}/homeCategoryFeatureView.js`,
    path: '/scripts/homeCategoryFeatureView.js',
    parentView: 'Gaclib-HomeView',
    htmlInfo: {}
};

export const views = [rootView, articleView, homeView, homeCategoryArticleView, homeCategoryFeatureView];
