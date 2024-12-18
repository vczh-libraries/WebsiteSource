import { PageLink } from 'gaclib-article';
import { DocSymbol } from 'gaclib-article-document';
import { DocTree } from '../../treeView.js';

export function convertDocSymbolToHyperlink(ds: DocSymbol, docTree: DocTree): PageLink | undefined {
    if (ds.docId !== undefined) {
        const dsTarget = docTree.ids[ds.docId];
        if (dsTarget !== undefined && dsTarget.path !== undefined) {
            return {
                kind: 'PageLink',
                href: `/${dsTarget.path.join('/')}.html`,
                content: [{
                    kind: 'Text',
                    text: ds.name
                }]
            };
        }
    }
    return undefined;
}
