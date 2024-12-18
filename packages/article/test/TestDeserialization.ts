import * as assert from 'assert';
import { EOL } from 'os';
import { Element } from 'xml-js';
import { Article, parseArticle, Plugin } from '../src/index.js';

test(`Empty Article`, () => {
    const input = `
<article>
    <topic>
        <title>Title</title>
    </topic>
</article>
`;
    const output: Article = {
        index: false,
        numberBeforeTitle: false,
        topic: {
            kind: 'Topic',
            title: 'Title',
            content: []
        }
    };
    assert.deepStrictEqual(parseArticle(input), output);
});

test(`Article with attributes`, () => {
    const input = `
<article index="true" numberBeforeTitle="true">
    <topic>
        <title>Title</title>
    </topic>
</article>
`;
    const output: Article = {
        index: true,
        numberBeforeTitle: true,
        topic: {
            kind: 'Topic',
            title: 'Title',
            content: []
        }
    };
    assert.deepStrictEqual(parseArticle(input), output);
});

test(`Nested topics`, () => {
    const input = `
<article>
    <topic>
        <title>Article</title>
        <topic><title>1.h2</title></topic>
        <topic>
            <topic><title>2.1.h3</title></topic>
            <topic><title>2.2.h3</title></topic>
            <title>2.h2</title>
        </topic>
    </topic>
</article>
`;
    const output: Article = {
        index: false,
        numberBeforeTitle: false,
        topic: {
            kind: 'Topic',
            title: 'Article',
            content: [
                {
                    kind: 'Topic',
                    title: '1.h2',
                    content: []
                },
                {
                    kind: 'Topic',
                    title: '2.h2',
                    content: [
                        {
                            kind: 'Topic',
                            title: '2.1.h3',
                            content: []
                        },
                        {
                            kind: 'Topic',
                            title: '2.2.h3',
                            content: []
                        }
                    ]
                }
            ]
        }
    };
    assert.deepStrictEqual(parseArticle(input), output);
});

test(`Flat paragraph`, () => {
    const input = `
<article>
    <topic>
        <title>Article</title>
        <p>
            <a href="./index.html"><b>Hey</b>, this is <em>an article</em>.</a>
            <as>
                <a href="./index1.html"><b>Hey</b>, this is <em>an article</em>.</a>
                <a href="./index2.html"/>
                <a href="./index3.html"/>
            </as>
            <name>GuiControl</name>
            <img src="logo.png"/>
            <img src="logo.png">This is a logo</img>
        </p>
    </topic>
</article>
`;
    const output: Article = {
        index: false,
        numberBeforeTitle: false,
        topic: {
            kind: 'Topic',
            title: 'Article',
            content: [
                {
                    kind: 'Paragraph',
                    content: [
                        {
                            kind: 'PageLink',
                            href: './index.html',
                            content: [
                                {
                                    kind: 'Strong',
                                    content: [{ kind: 'Text', text: 'Hey' }]
                                },
                                {
                                    kind: 'Text',
                                    text: ', this is '
                                },
                                {
                                    kind: 'Emphasise',
                                    content: [{ kind: 'Text', text: 'an article' }]
                                },
                                {
                                    kind: 'Text',
                                    text: '.'
                                }
                            ]
                        }, {
                            kind: 'MultiPageLink',
                            href: ['./index1.html', './index2.html', './index3.html'],
                            content: [
                                {
                                    kind: 'Strong',
                                    content: [{ kind: 'Text', text: 'Hey' }]
                                },
                                {
                                    kind: 'Text',
                                    text: ', this is '
                                },
                                {
                                    kind: 'Emphasise',
                                    content: [{ kind: 'Text', text: 'an article' }]
                                },
                                {
                                    kind: 'Text',
                                    text: '.'
                                }
                            ]
                        },
                        {
                            kind: 'Name',
                            text: 'GuiControl'
                        },
                        {
                            kind: 'Image',
                            src: 'logo.png'
                        },
                        {
                            kind: 'Image',
                            src: 'logo.png',
                            caption: 'This is a logo'
                        }
                    ]
                }
            ]
        }
    };
    assert.deepStrictEqual(parseArticle(input), output);
});

test(`Simple program`, () => {
    const input = `
<article>
    <topic>
        <title>Article</title>
        <p>
            <program>
                <code>
                    <![CDATA[
#include <iostream>
using namespace std;

int main()
{
    cout << "Hello, world!";
    return 0;
}
                    ]]>
                </code>
            </program>
        </p>
    </topic>
</article>
`;
    const output: Article = {
        index: false,
        numberBeforeTitle: false,
        topic: {
            kind: 'Topic',
            title: 'Article',
            content: [
                {
                    kind: 'Paragraph',
                    content: [
                        {
                            kind: 'Program',
                            code: `#include <iostream>
using namespace std;

int main()
{
    cout << "Hello, world!";
    return 0;
}`.split(/\r?\n/).join(EOL)
                        }
                    ]
                }
            ]
        }
    };
    assert.deepStrictEqual(parseArticle(input), output);
});

test(`Multiple cdata program`, () => {
    const input = `
<article>
    <topic>
        <title>Article</title>
        <p>
            <program>
                <code>
                    <![CDATA[
#include <iostream>
using namespace std;
]]><![CDATA[
int main()
{
    cout << "Hello, world!";
    return 0;
}
                    ]]>
                </code>
            </program>
        </p>
    </topic>
</article>
`;
    const output: Article = {
        index: false,
        numberBeforeTitle: false,
        topic: {
            kind: 'Topic',
            title: 'Article',
            content: [
                {
                    kind: 'Paragraph',
                    content: [
                        {
                            kind: 'Program',
                            code: `#include <iostream>
using namespace std;

int main()
{
    cout << "Hello, world!";
    return 0;
}`.split(/\r?\n/).join(EOL)
                        }
                    ]
                }
            ]
        }
    };
    assert.deepStrictEqual(parseArticle(input), output);
});

test(`Complex program`, () => {
    const input = `
<article>
    <topic>
        <title>Article</title>
        <p>
            <program project="vlpp" language="C++">
                <code>
                    <![CDATA[
#include <iostream>
using namespace std;

int main()
{
    cout << "Hello, world!" << endl;
    cout << "This is a C++ program!" << endl;
    return 0;
}
                    ]]>
                </code>
                <output>
                <![CDATA[
Hello, world!
This is a C++ program!
                ]]>
                </output>
            </program>
        </p>
    </topic>
</article>
`;
    const output: Article = {
        index: false,
        numberBeforeTitle: false,
        topic: {
            kind: 'Topic',
            title: 'Article',
            content: [
                {
                    kind: 'Paragraph',
                    content: [
                        {
                            kind: 'Program',
                            project: 'vlpp',
                            language: 'C++',
                            code: `#include <iostream>
using namespace std;

int main()
{
    cout << "Hello, world!" << endl;
    cout << "This is a C++ program!" << endl;
    return 0;
}`.split(/\r?\n/).join(EOL),
                            output: [
                                'Hello, world!',
                                'This is a C++ program!'
                            ]
                        }
                    ]
                }
            ]
        }
    };
    assert.deepStrictEqual(parseArticle(input), output);
});

test(`List`, () => {
    const input = `
<article>
    <topic>
        <title>Article</title>
        <p>
            <ol><li>1</li><li><b>2</b></li><li><em>3</em></li></ol>
            <ul>
                <li>
                    <p>1</p>
                </li>
                <li>
                    <p>1</p>
                    <p>2</p>
                </li>
                <li>
                    <p>1</p>
                    <p>2</p>
                    <p>3</p>
                </li>
            </ul>
        </p>
    </topic>
</article>
`;
    const output: Article = {
        index: false,
        numberBeforeTitle: false,
        topic: {
            kind: 'Topic',
            title: 'Article',
            content: [
                {
                    kind: 'Paragraph',
                    content: [
                        {
                            kind: 'List',
                            ordered: true,
                            items: [
                                {
                                    kind: 'ContentListItem',
                                    content: [{ kind: 'Text', text: '1' }]
                                },
                                {
                                    kind: 'ContentListItem',
                                    content: [{ kind: 'Strong', content: [{ kind: 'Text', text: '2' }] }]
                                },
                                {
                                    kind: 'ContentListItem',
                                    content: [{ kind: 'Emphasise', content: [{ kind: 'Text', text: '3' }] }]
                                }
                            ]
                        },
                        {
                            kind: 'List',
                            ordered: false,
                            items: [
                                {
                                    kind: 'ParagraphListItem',
                                    paragraphs: [
                                        {
                                            kind: 'Paragraph',
                                            content: [{ kind: 'Text', text: '1' }]
                                        }
                                    ]
                                },
                                {
                                    kind: 'ParagraphListItem',
                                    paragraphs: [
                                        {
                                            kind: 'Paragraph',
                                            content: [{ kind: 'Text', text: '1' }]
                                        },
                                        {
                                            kind: 'Paragraph',
                                            content: [{ kind: 'Text', text: '2' }]
                                        }
                                    ]
                                },
                                {
                                    kind: 'ParagraphListItem',
                                    paragraphs: [
                                        {
                                            kind: 'Paragraph',
                                            content: [{ kind: 'Text', text: '1' }]
                                        },
                                        {
                                            kind: 'Paragraph',
                                            content: [{ kind: 'Text', text: '2' }]
                                        },
                                        {
                                            kind: 'Paragraph',
                                            content: [{ kind: 'Text', text: '3' }]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };
    assert.deepStrictEqual(parseArticle(input), output);
});

test(`Plugin`, () => {
    const input = `
<article>
    <topic>
        <title>Article</title>
        <p>This is a <b><plugin value="1"/></b>.</p>
        <p>This is another <b><plugin value="2"/></b>.</p>
    </topic>
</article>
`;
    const output: Article = {
        index: false,
        numberBeforeTitle: false,
        topic: {
            kind: 'Topic',
            title: 'Article',
            content: [{
                kind: 'Paragraph',
                content: [
                    {
                        kind: 'Text',
                        text: 'This is a '
                    },
                    {
                        kind: 'Strong',
                        content: [{
                            kind: 'Plugin',
                            plugin: 1
                        }]
                    },
                    {
                        kind: 'Text',
                        text: '.'
                    }
                ]
            }, {
                kind: 'Paragraph',
                content: [
                    {
                        kind: 'Text',
                        text: 'This is another '
                    },
                    {
                        kind: 'Strong',
                        content: [{
                            kind: 'Plugin',
                            plugin: 2
                        }]
                    },
                    {
                        kind: 'Text',
                        text: '.'
                    }
                ]
            }]
        }
    };

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

    assert.deepStrictEqual(parseArticle(input, pluginParser), output);
});
