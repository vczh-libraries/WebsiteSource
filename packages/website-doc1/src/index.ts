import { readFileSync, writeFileSync } from 'fs';
import { Article, parseArticle } from 'gaclib-article';
import { createMvcServer, hostUntilPressingEnter, litHtmlViewCallback, registerFolder, untilPressEnter } from 'gaclib-host';
import { createRouter, route } from 'gaclib-mvc';
import { collectStaticUrls, downloadWebsite } from 'gaclib-spider';
import * as path from 'path';
import { getDirectoryInfoFromPath, loadDocTree, stepIndexByPath } from './treeView';
import { DirectoryInfo, views } from './views';

const pathPrefix = `/doc/current`;

function loadArticle(filename: string): Article {
    const xml = readFileSync(path.join(__dirname, `../src/articles/${filename}`), { encoding: 'utf-8' });
    return parseArticle(xml);
}

const router = createRouter<[string, string | Buffer]>(pathPrefix);
registerFolder(router, path.join(__dirname, `./dist`));

console.log('Loading references ...');
const docTree = loadDocTree(path.join(__dirname, `../src/articles/reference.xml`));
writeFileSync(
    path.join(__dirname, `reference.json`),
    JSON.stringify(docTree.root, undefined, 4),
    { encoding: 'utf-8' }
);

const homeNode = stepIndexByPath(docTree.index, ['home']);
router.register(
    [],
    route`/home.html`,
    litHtmlViewCallback(
        views,
        'Gaclib-ArticleView',
        {
            info: { pathPrefix, title: `${homeNode?.node?.name} -- GPU Accelerated C++ User Interface (vczh)` },
            embeddedResources: {
                directoryInfo: <DirectoryInfo>getDirectoryInfoFromPath(docTree, pathPrefix, ['home'], homeNode),
                article: loadArticle('home.xml')
            }
        }
    )
);

router.register(
    [],
    route`${{ path: [''] }}.html`,
    (method: HttpMethods, model: { path: string[] }): [string, string] | undefined => {
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
