import * as a from 'gaclib-article';
import * as d from './interfaces';

type DocSymbolConverter = (docSymbol: d.DocSymbol) => a.Content;

function renderDocText(docText: d.DocText, title: string, dsc: DocSymbolConverter): a.Topic {
    return {
        kind: 'Topic',
        title,
        content: docText.paragraphs.map((p: d.DocParagraph) => ({
            kind: 'Paragraph',
            content: p.content.map((c: a.Content | d.DocSymbol) => {
                switch (c.kind) {
                    case 'Symbol':
                        return dsc(c);
                    default:
                        return c;
                }
            })
        }))
    };
}

export function renderDocument(docArticle: d.DocArticle, title: string, dsc: DocSymbolConverter): a.Article {
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
        article.topic.content.push(renderDocText(docArticle.summary, 'Summary', dsc));
    }
    if (docArticle.enumitem !== undefined) {
        article.topic.content.push({
            kind: 'Topic',
            title: 'Enum Items',
            content: docArticle.enumitem.map((dt: d.DocText) => renderDocText(dt, `${dt.name}`, dsc))
        });
    }
    if (docArticle.typeparam !== undefined) {
        article.topic.content.push({
            kind: 'Topic',
            title: 'Type Parameters',
            content: docArticle.typeparam.map((dt: d.DocText) => renderDocText(dt, `${dt.name}`, dsc))
        });
    }
    if (docArticle.param !== undefined) {
        article.topic.content.push({
            kind: 'Topic',
            title: 'Parameters',
            content: docArticle.param.map((dt: d.DocText) => renderDocText(dt, `${dt.name}`, dsc))
        });
    }
    if (docArticle.returns !== undefined) {
        article.topic.content.push(renderDocText(docArticle.returns, 'Return Value', dsc));

    }
    if (docArticle.remarks !== undefined) {
        article.topic.content.push(renderDocText(docArticle.remarks, 'Remarks', dsc));

    }
    if (docArticle.example !== undefined) {
        article.topic.content.push({
            kind: 'Topic',
            title: 'Example',
            content: [{
                kind: 'Paragraph',
                content: [{
                    kind: 'Program',
                    code: docArticle.example
                }]
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

    return article;
}
