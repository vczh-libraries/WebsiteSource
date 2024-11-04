import { ViewMetadata } from 'gaclib-render';

const rootView: ViewMetadata = {
    name: 'Gaclib-RootView',
    source: 'rootView.js',
    path: '/scripts/rootView.js',
    containerId: 'rootViewContainer',
    htmlInfo: {
        shortcutIcon: '/favicon.ico',
        styleSheets: ['/global.css', '/article.css']
    }
};

const directoryView: ViewMetadata = {
    name: 'Gaclib-DirectoryView',
    source: 'directoryView.js',
    path: '/scripts/directoryView.js',
    containerId: 'directoryViewContainer',
    parentView: 'Gaclib-RootView',
    htmlInfo: {}
};

const registeredTypesView: ViewMetadata = {
    name: 'Gaclib-RegisteredTypesView',
    source: 'registeredTypesView.js',
    path: '/scripts/registeredTypesView.js',
    parentView: 'Gaclib-DirectoryView',
    htmlInfo: {}
};

const articleView: ViewMetadata = {
    name: 'Gaclib-ArticleView',
    source: 'articleView.js',
    path: '/scripts/articleView.js',
    parentView: 'Gaclib-DirectoryView',
    htmlInfo: {}
};

const namespaceView: ViewMetadata = {
    name: 'Gaclib-NamespaceView',
    source: 'namespaceView.js',
    path: '/scripts/namespaceView.js',
    parentView: 'Gaclib-DirectoryView',
    htmlInfo: {}
};

const documentView: ViewMetadata = {
    name: 'Gaclib-DocumentView',
    source: 'documentView.js',
    path: '/scripts/documentView.js',
    parentView: 'Gaclib-DirectoryView',
    htmlInfo: {}
};

const unfinishedView: ViewMetadata = {
    name: 'Gaclib-UnfinishedView',
    source: 'unfinishedView.js',
    path: '/scripts/unfinishedView.js',
    parentView: 'Gaclib-DirectoryView',
    htmlInfo: {}
};

export const views = [rootView, directoryView, registeredTypesView, articleView, namespaceView, documentView, unfinishedView];
export { DirectoryInfo, DirectoryNode } from './directoryView';
