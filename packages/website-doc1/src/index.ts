import { readFileSync, writeFileSync } from 'fs';
import { parseArticle } from 'gaclib-article';
import { DocSymbol, parseDocArticle, renderDocArticle } from 'gaclib-article-document';
import { createMvcServer, hostUntilPressingEnter, registerFolder, untilPressEnter } from 'gaclib-host';
import { createRouter, route } from 'gaclib-mvc';
import { EmbeddedResources, generateHtml, HtmlInfo } from 'gaclib-render';
import { collectStaticUrls, downloadWebsite } from 'gaclib-spider';
import * as path from 'path';
import { getDirectoryInfoFromPath, loadDocTree, stepIndexByPath } from './treeView';
import { DirectoryInfo, views } from './views';

const pathPrefix = `/doc/current`;

const router = createRouter<[string, string | Buffer]>(pathPrefix);
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
    (method: {}, model: { path: string[] }): [string, string] | undefined => {
        const dindex = stepIndexByPath(docTree.index, model.path);
        if (dindex === undefined || dindex.node === undefined) {
            return undefined;
        }

        const dnode = dindex.node;
        const info: HtmlInfo = { pathPrefix, title: `${dnode.name} -- GPU Accelerated C++ User Interface (vczh)` };
        const res: EmbeddedResources = {
            directoryInfo: <DirectoryInfo>getDirectoryInfoFromPath(docTree, pathPrefix, model.path, dindex)
        };

        switch (dnode.kind) {
            case 'article': {
                res.article = parseArticle(readFileSync(<string>dnode.file, { encoding: 'utf-8' }));
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
                    parseDocArticle(readFileSync(<string>dnode.file, { encoding: 'utf-8' })),
                    dnode.name,
                    (ds: DocSymbol) => {
                        if (ds.docId === undefined) {

                        } else {
                            return { kind: 'Text', text: `${JSON.stringify(ds)} (source link)` };
                        }
                    });
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
    }
);

console.log(JSON.stringify(process.argv, undefined, 4));
const server = createMvcServer(router);

if (process.argv[2] === '-d') {
    server.listen(8080, 'localhost');
    downloadWebsite(collectStaticUrls(router), path.join(__dirname, './website'));
    untilPressEnter();
} else {
    hostUntilPressingEnter(server, 8080);
}
