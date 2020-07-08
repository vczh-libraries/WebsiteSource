import * as a from 'gaclib-article';
import * as d from './interfaces';

type DocSymbolConverter = (docSymbol: d.DocSymbol) => a.Content;

function renderDocText(docText: d.DocText, title: string): a.Topic {
    return {
        kind: 'Topic',
        title,
        content: docText.paragraphs
    };
}

export function renderDocArticle(docArticle: d.DocArticle, title: string, dsc: DocSymbolConverter): a.Article {
    const article: a.Article = {
        index: false,
        numberBeforeTitle: false,
        topic: {
            kind: 'Topic',
            title,
            content: []
        }
    };

    if (docArticle.signature !== undefined) {
        article.topic.content.push({
            kind: 'Topic',
            title: 'Signature',
            content: [{
                kind: 'Paragraph',
                content: [{
                    kind: 'Strong',
                    content: [{
                        kind: 'Text',
                        text: 'Jump to '
                    }, dsc({
                        name: 'source code',
                        declFile: docArticle.declFile,
                        declId: docArticle.declId
                    })]
                }]
            }, {
                kind: 'Paragraph',
                content: [{
                    kind: 'Program',
                    code: docArticle.signature
                }]
            }]
        });
    }

    if (docArticle.summary !== undefined) {
        article.topic.content.push(renderDocText(docArticle.summary, 'Summary'));
    }

    if (docArticle.enumitem !== undefined) {
        article.topic.content.push({
            kind: 'Topic',
            title: 'Enum Items',
            content: docArticle.enumitem.map((dt: d.DocText) => renderDocText(dt, `${dt.name}`))
        });
    }

    if (docArticle.typeparam !== undefined) {
        article.topic.content.push({
            kind: 'Topic',
            title: 'Type Parameters',
            content: docArticle.typeparam.map((dt: d.DocText) => renderDocText(dt, `${dt.name}`))
        });
    }

    if (docArticle.param !== undefined) {
        article.topic.content.push({
            kind: 'Topic',
            title: 'Parameters',
            content: docArticle.param.map((dt: d.DocText) => renderDocText(dt, `${dt.name}`))
        });
    }

    if (docArticle.returns !== undefined) {
        article.topic.content.push(renderDocText(docArticle.returns, 'Return Value'));

    }

    if (docArticle.remarks !== undefined) {
        article.topic.content.push(renderDocText(docArticle.remarks, 'Remarks'));

    }

    if (docArticle.example !== undefined) {
        article.topic.content.push({
            kind: 'Topic',
            title: 'Example',
            content: [{
                kind: 'Paragraph',
                content: [
                    docArticle.example.output === undefined
                        ? {
                            kind: 'Program',
                            code: docArticle.example.code
                        }
                        : {
                            kind: 'Program',
                            code: docArticle.example.code,
                            output: docArticle.example.output.split('\n')
                        }
                ]
            }]
        });
    }

    if (docArticle.basetypes !== undefined) {
        article.topic.content.push({
            kind: 'Topic',
            title: 'Base Types',
            content: [{
                kind: 'Paragraph',
                content: [{
                    kind: 'List',
                    ordered: false,
                    items: docArticle.basetypes.map((ds: d.DocSymbol) => ({
                        kind: 'ContentListItem',
                        content: [dsc(ds)]
                    }))
                }]
            }]
        });
    }

    if (docArticle.seealsos !== undefined) {
        article.topic.content.push({
            kind: 'Topic',
            title: 'See Also',
            content: [{
                kind: 'Paragraph',
                content: [{
                    kind: 'List',
                    ordered: false,
                    items: docArticle.seealsos.map((ds: d.DocSymbol) => ({
                        kind: 'ContentListItem',
                        content: [dsc(ds)]
                    }))
                }]
            }]
        });
    }

    a.consumePlugin(article, (p: {}): a.Content[] => {
        const dsymbols = <d.DocSymbolsPluginObject>(p);
        if (dsymbols.symbols.length === 0) {
            throw new Error('DocSymbols should contain at least 1 DocSymbol.');
        } else if (dsymbols.symbols.length === 1) {
            return [dsc(dsymbols.symbols[0])];
        } else {
            return dsymbols.symbols
                .map((ds: d.DocSymbol) => [dsc(ds)])
                .reduce((x: a.Content[], y: a.Content[]) => x.concat([{ kind: 'Text', text: ', ' }]).concat(y));
        }
    });

    return article;
}
