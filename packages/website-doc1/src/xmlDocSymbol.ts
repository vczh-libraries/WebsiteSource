import { Content } from 'gaclib-article';
import { DocSymbol } from 'gaclib-article-document';
import { DocTree } from './treeView';

export function convertDocSymbolToHyperlink(ds: DocSymbol, docTree: DocTree, pathPrefix: string): Content {
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
