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
    htmlInfo: {}
};

const homeCategoryView: ViewMetadata = {
    name: 'Gaclib-HomeCategoryView',
    source: `${__dirname}/homeCategoryView.js`,
    path: '/scripts/homeCategoryView.js',
    parentView: 'Gaclib-HomeView',
    htmlInfo: {}
};

export const views = [rootView, articleView, homeView, homeCategoryView];
