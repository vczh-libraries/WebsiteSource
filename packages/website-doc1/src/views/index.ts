import { ViewMetadata } from 'gaclib-render';

const rootView: ViewMetadata = {
    name: 'Gaclib-RootView',
    source: `${__dirname}/rootView.js`,
    path: '/scripts/rootView.js',
    containerId: 'rootViewContainer',
    htmlInfo: {
        shortcutIcon: '/favicon.ico',
        styleSheets: ['/global.css', '/article.css']
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

const namespaceView: ViewMetadata = {
    name: 'Gaclib-NamespaceView',
    source: `${__dirname}/namespaceView.js`,
    path: '/scripts/namespaceView.js',
    parentView: 'Gaclib-DirectoryView',
    htmlInfo: {}
};

const documentView: ViewMetadata = {
    name: 'Gaclib-DocumentView',
    source: `${__dirname}/documentView.js`,
    path: '/scripts/documentView.js',
    parentView: 'Gaclib-DirectoryView',
    htmlInfo: {}
};

export const views = [rootView, directoryView, articleView, namespaceView, documentView];
export { DirectoryInfo, DirectoryNode } from './directoryView';
