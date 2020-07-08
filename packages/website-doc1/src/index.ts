import { readFileSync, writeFileSync } from 'fs';
import { Content, parseArticle } from 'gaclib-article';
import { DocExample, DocSymbol, parseDocArticle, renderDocArticle } from 'gaclib-article-document';
import { createMvcServer, hostUntilPressingEnter, registerFolder, untilPressEnter } from 'gaclib-host';
import { createRouter, route } from 'gaclib-mvc';
import { EmbeddedResources, generateHtml, HtmlInfo } from 'gaclib-render';
import { collectStaticUrls, downloadWebsite } from 'gaclib-spider';
import * as path from 'path';
import { Element, xml2js } from 'xml-js';
import { DocTreeNode, getDirectoryInfoFromPath, loadDocTree, stepIndexByPath } from './treeView';
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

function convertDocSymbolToHyperlink(ds: DocSymbol): Content {
    if (ds.docId !== undefined) {
        const dsTarget = docTree.ids[ds.docId];
        if (dsTarget !== undefined && dsTarget.path !== undefined) {
            return {
                kind: 'PageLink',
                href: `${pathPrefix}/${dsTarget.path.join('/')}.html`,
                content: [{
                    kind: 'Text',
                    text: ds.name
                }]
            };
        }
    }
    return {
        kind: 'PageLink',
        href: `/CodeIndexDemo/Gaclib/SourceFiles/${ds.declFile}.html#${ds.declId}`,
        content: [{
            kind: 'Text',
            text: ds.name
        }]
    };
}

function exampleRetriver(documentFile: string, index: number): DocExample {
    const fragments = documentFile.split('/');
    const category = fragments[fragments.length - 2];
    const fileName = fragments[fragments.length - 1].slice(0, -4);

    const codeXml = <Element>xml2js(
        readFileSync(`${fileName}.ein.${index}.xml`, { encoding: 'utf-8' }),
        {
            compact: false,
            ignoreDeclaration: true,
            ignoreInstruction: true,
            ignoreComment: true,
            ignoreDoctype: true
        }
    );
    const code = <string>((codeXml.elements ?? [])[0].elements ?? [])[0].cdata;
    const output = readFileSync(`${fileName}.eout.${index}.txt`, { encoding: 'utf-8' });

    return {
        code: `// ${category}\n${code}`,
        output
    };
}

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

        try {
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
                        parseDocArticle(
                            readFileSync(<string>dnode.file, { encoding: 'utf-8' }),
                            (index: number): DocExample => exampleRetriver(<string>dnode.file, index)),
                        dnode.name,
                        convertDocSymbolToHyperlink);
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
