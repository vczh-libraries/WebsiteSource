import * as a from 'gaclib-article';
import * as d from './interfaces';

type DocSymbolConverter = (docSymbol: d.DocSymbol) => a.PageLink | undefined;

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
        const items: a.ContentListItem[] = docArticle.basetypes
            .map(dsc)
            .filter(Boolean)
            .map((pageLink: a.PageLink) => ({
                kind: 'ContentListItem',
                content: [pageLink]
            }));
        if (items.length > 0) {
            article.topic.content.push({
                kind: 'Topic',
                title: 'Base Types',
                content: [{
                    kind: 'Paragraph',
                    content: [{
                        kind: 'List',
                        ordered: false,
                        items
                    }]
                }]
            });
        }
    }

    if (docArticle.seealsos !== undefined) {
        const items: a.ContentListItem[] = docArticle.seealsos
            .map(dsc)
            .filter(Boolean)
            .map((pageLink: a.PageLink) => ({
                kind: 'ContentListItem',
                content: [pageLink]
            }));
        if (items.length > 0) {
            article.topic.content.push({
                kind: 'Topic',
                title: 'See Also',
                content: [{
                    kind: 'Paragraph',
                    content: [{
                        kind: 'List',
                        ordered: false,
                        items
                    }]
                }]
            });
        }
    }

    a.consumePlugin(article, (p: {}): a.Content[] => {
        const dsymbols = <d.DocSymbolsPluginObject>(p);
        if (dsymbols.symbols.length === 0) {
            throw new Error('DocSymbols should contain at least 1 DocSymbol.');
        } else {
            const links = <a.PageLink[]>dsymbols.symbols.map(dsc).filter(Boolean);
            if (links.length === 0) {
                return [];
            } else if (links.length === 1) {
                return links;
            } else {
                return [{
                    kind: 'MultiPageLink',
                    href: links.map((link: a.PageLink) => link.href),
                    content: links[0].content
                }];
            }
        }
    });

    return article;
}
