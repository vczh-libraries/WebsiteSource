import { readFileSync, writeFileSync } from 'fs';
import { consumePlugin, parseArticle } from 'gaclib-article';
import { DocSymbol, parseDocArticle, renderDocArticle } from 'gaclib-article-document';
import { createMvcServer, hostUntilPressingEnter, MvcRouterResult, registerFolder, untilPressEnter } from 'gaclib-host';
import { createRouter, route } from 'gaclib-mvc';
import { EmbeddedResources, generateHtml, HtmlInfo } from 'gaclib-render';
import { collectStaticUrls, downloadWebsite } from 'gaclib-spider';
import * as path from 'path';
import { parseArticlePlugin, renderArticlePlugin } from './plugins/article/index.js';
import { parseControlTemplateArticle, renderControlTemplateArticle } from './plugins/control-template/xmlControlTemplateArticle.js';
import { convertDocSymbolToHyperlink } from './plugins/document/xmlDocSymbol.js';
import { exampleRetriver } from './plugins/document/xmlExample.js';
import { DocTreeNode, getDirectoryInfoFromPath, loadDocTree, stepIndexByPath } from './treeView.js';
import { DirectoryInfo, views } from './views/index.js';

const __dirname = path.resolve('./lib');
const pathPrefix = `/doc/current`;

const router = createRouter<MvcRouterResult>(pathPrefix);
registerFolder(router, path.join(__dirname, `./dist`));

console.log('Loading references ...');
const docTree = loadDocTree(path.join(__dirname, `../src/articles/reference.xml`));
writeFileSync(
    path.join(__dirname, `reference.json`),
    JSON.stringify(docTree.root, undefined, 4),
    { encoding: 'utf-8' }
);

router.register(
    [],
    route`/${{ path: [''] }}.html`,
    (method: {}, model: { path: string[] }) => {
        const dindex = stepIndexByPath(docTree.index, model.path);
        if (dindex === undefined || dindex.node === undefined) {
            return undefined;
        }

        const dnode = dindex.node;
        const info: HtmlInfo = { pathPrefix, title: `${dnode.name} -- GPU Accelerated C++ User Interface (vczh)` };
        const res: EmbeddedResources = {
            hrefPrefix: pathPrefix,
            directoryInfo: <DirectoryInfo>getDirectoryInfoFromPath(docTree, model.path, dindex)
        };

        try {
            switch (dnode.kind) {
                case 'unfinished': {
                    const generatedHtml = generateHtml(
                        info,
                        views,
                        'Gaclib-UnfinishedView',
                        model,
                        '',
                        res
                    );
                    return ['text/html', generatedHtml];
                }
                case 'registeredTypes': {
                    res.projectName = dnode.name;
                    //res.registeredTypesInfo = getRegisteredTypes(dnode.name);
                    const generatedHtml = generateHtml(
                        info,
                        views,
                        'Gaclib-UnfinishedView', //'Gaclib-RegisteredTypesView'
                        model,
                        '',
                        res
                    );
                    return ['text/html', generatedHtml];
                }
                case 'article': {
                    const article = parseArticle(readFileSync(<string>dnode.file, { encoding: 'utf-8' }), parseArticlePlugin);
                    consumePlugin(article, renderArticlePlugin);
                    res.article = article;
                    const generatedHtml = generateHtml(
                        info,
                        views,
                        'Gaclib-ArticleView',
                        model,
                        '',
                        res
                    );
                    return ['text/html', generatedHtml];
                }
                case 'control-template': {
                    const ctArticle = parseControlTemplateArticle(readFileSync(<string>dnode.file, { encoding: 'utf-8' }), parseArticlePlugin);
                    const article = renderControlTemplateArticle(ctArticle, <string>dnode.docId);
                    consumePlugin(article, renderArticlePlugin);
                    res.article = article;
                    const generatedHtml = generateHtml(
                        info,
                        views,
                        'Gaclib-ArticleView',
                        model,
                        '',
                        res
                    );
                    return ['text/html', generatedHtml];
                }
                case 'namespace': {
                    res.namespaceName = dnode.name;
                    const generatedHtml = generateHtml(
                        info,
                        views,
                        'Gaclib-NamespaceView',
                        model,
                        '',
                        res
                    );
                    return ['text/html', generatedHtml];
                }
                case 'document': {
                    res.documentArticle = renderDocArticle(
                        parseDocArticle(
                            readFileSync(<string>dnode.file, { encoding: 'utf-8' }),
                            (index: number) => exampleRetriver(<string>dnode.file, index)
                        ),
                        dnode.name,
                        (ds: DocSymbol) => convertDocSymbolToHyperlink(ds, docTree)
                    );
                    const generatedHtml = generateHtml(
                        info,
                        views,
                        'Gaclib-DocumentView',
                        model,
                        '',
                        res
                    );
                    return ['text/html', generatedHtml];
                }
                default:
                    return undefined;
            }
        } catch (err) {
            console.error(`<${model.path.join('/')}>:\r\n${(<Error>err).stack}`);
            return undefined;
        }
    }
);

console.log(JSON.stringify(process.argv, undefined, 4));
const server = createMvcServer(router);

function collectDocUrls(dnode: DocTreeNode, docUrls: string[]): void {
    if (dnode.path !== undefined) {
        docUrls.push(`${pathPrefix}/${dnode.path.join('/')}.html`);
    }
    if (dnode.subNodes !== undefined) {
        for (const subNode of dnode.subNodes) {
            collectDocUrls(subNode, docUrls);
        }
    }
}

if (process.argv[2] === '-d') {
    server.listen(8080, 'localhost');

    const docUrls: string[] = [];
    collectDocUrls(docTree.root, docUrls);

    downloadWebsite(collectStaticUrls(router).concat(docUrls), path.join(__dirname, './website'));
    untilPressEnter();
} else {
    hostUntilPressingEnter(server, 8080);
}
