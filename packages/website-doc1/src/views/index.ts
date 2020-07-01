import { ViewMetadata } from 'gaclib-render';

const rootView: ViewMetadata = {
    name: 'Gaclib-RootView',
    source: `${__dirname}/rootView.js`,
    path: '/scripts/rootView.js',
    containerId: 'rootViewContainer',
    htmlInfo: {
        shortcutIcon: '/favicon.ico',
        styleSheets: ['/global.css']
    }
};

const directoryView: ViewMetadata = {
    name: 'Gaclib-DirectoryView',
    source: `${__dirname}/directoryView.js`,
    path: '/scripts/directoryView.js',
    containerId: 'directoryViewContainer',
    parentView: 'Gaclib-RootView',
    htmlInfo: {}
};

const articleView: ViewMetadata = {
    name: 'Gaclib-ArticleView',
    source: `${__dirname}/articleView.js`,
    path: '/scripts/articleView.js',
    parentView: 'Gaclib-DirectoryView',
    htmlInfo: {}
};

export const views = [rootView, directoryView, articleView];
