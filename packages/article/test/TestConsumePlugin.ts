import * as assert from 'assert';
import { Element } from 'xml-js';
import { Article, consumePlugin, Content, parseArticle, Plugin } from '../src';

function pluginParser(e: Element): Plugin | undefined {
    if (e.name === 'plugin') {
        return {
            kind: 'Plugin',
            plugin: +<string>(e.attributes?.value)
        };
    } else {
        return undefined;
    }
}

function pluginConverter(p: {}): Content[] {
    return [{ kind: 'Text', text: `<${p}>` }];
}

test(`Consume plugin`, () => {
    const input = `
<article>
    <topic>
        <title>Title</title>
        <p>Head<plugin value="1"/>Tail</p>
        <p><b><plugin value="2"/></b></p>
    </topic>
</article>
`;
    const output: Article = {
        index: false,
        numberBeforeTitle: false,
        topic: {
            kind: 'Topic',
            title: 'Title',
            content: [{
                kind: 'Paragraph',
                content: [{ kind: 'Text', text: 'Head' }, { kind: 'Text', text: '<1>' }, { kind: 'Text', text: 'Tail' }]
            }, {
                kind: 'Paragraph',
                content: [{ kind: 'Strong', content: [{ kind: 'Text', text: '<2>' }] }]
            }]
        }
    };

    const article = parseArticle(input, pluginParser);
    consumePlugin(article, pluginConverter);
    assert.deepStrictEqual(article, output);
});

test(`Consume plugin in nested topic`, () => {
    const input = `
<article>
    <topic>
        <title>Title</title>
        <topic>
            <title>Nested</title>
            <p>Head<plugin value="1"/>Tail</p>
            <p><b><plugin value="2"/></b></p>
        </topic>
    </topic>
</article>
`;
    const output: Article = {
        index: false,
        numberBeforeTitle: false,
        topic: {
            kind: 'Topic',
            title: 'Title',
            content: [{
                kind: 'Topic',
                title: 'Nested',
                content: [{
                    kind: 'Paragraph',
                    content: [{ kind: 'Text', text: 'Head' }, { kind: 'Text', text: '<1>' }, { kind: 'Text', text: 'Tail' }]
                }, {
                    kind: 'Paragraph',
                    content: [{ kind: 'Strong', content: [{ kind: 'Text', text: '<2>' }] }]
                }]
            }]
        }
    };

    const article = parseArticle(input, pluginParser);
    consumePlugin(article, pluginConverter);
    assert.deepStrictEqual(article, output);
});
