import * as assert from 'assert';
import { DocArticle, DocExample, parseDocArticle } from '../src';

function exampleRetriver(index: number): DocExample {
    return {
        code: `code<${index}>`,
        output: `output<${index}>`
    };
}

test(`Empty Document`, () => {
    const input = `
<Document symbolId="::MyClass" accessor="" category="Class" name="MyClass" declFile="F" declId="I">
</Document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass',
        declFile: 'F',
        declId: 'I'
    };
    assert.deepStrictEqual(parseDocArticle(input, exampleRetriver), output);
});

test(`<signature>`, () => {
    const input = `
<Document symbolId="::MyClass" accessor="" category="Class" name="MyClass" declFile="F" declId="I">
  <signature><![CDATA[this is a signature]]></signature>
</Document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass',
        declFile: 'F',
        declId: 'I',
        signature: 'this is a signature'
    };
    assert.deepStrictEqual(parseDocArticle(input, exampleRetriver), output);
});

test(`<example> 1`, () => {
    const input = `
<Document symbolId="::MyClass" accessor="" category="Class" name="MyClass" declFile="F" declId="I">
  <example><![CDATA[this is an example]]></example>
</Document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass',
        declFile: 'F',
        declId: 'I',
        example: { code: 'this is an example' }
    };
    assert.deepStrictEqual(parseDocArticle(input, exampleRetriver), output);
});

test(`<example> 2`, () => {
    const input = `
<Document symbolId="::MyClass" accessor="" category="Class" name="MyClass" declFile="F" declId="I">
  <signature><![CDATA[this is a signature]]></signature>
  <example index="5"/>
</Document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass',
        declFile: 'F',
        declId: 'I',
        signature: 'this is a signature',
        example: { code: 'code<5>', output: 'output<5>' }
    };
    assert.deepStrictEqual(parseDocArticle(input, exampleRetriver), output);
});

test(`<basetypes> and <seealsos>`, () => {
    const input = `
<Document symbolId="::MyClass" accessor="" category="Class" name="MyClass" declFile="F" declId="I">
  <basetypes>
    <symbol name="x" docId="A" declFile="B" declId="C"/>
    <symbol name="y" docId="D" declFile="E" declId="F"/>
  </basetypes>
  <seealsos>
    <symbol name="z" declFile="B" declId="C"/>
    <symbol name="w" declFile="E" declId="F"/>
  </seealsos>
</Document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass',
        declFile: 'F',
        declId: 'I',
        basetypes: [
            { name: 'x', docId: 'A', declFile: 'B', declId: 'C' },
            { name: 'y', docId: 'D', declFile: 'E', declId: 'F' }
        ],
        seealsos: [
            { name: 'z', declFile: 'B', declId: 'C' },
            { name: 'w', declFile: 'E', declId: 'F' }
        ]
    };
    assert.deepStrictEqual(parseDocArticle(input, exampleRetriver), output);
});

test(`<summary> with text`, () => {
    const input = `
<Document symbolId="::MyClass" accessor="" category="Class" name="MyClass" declFile="F" declId="I">
  <summary>
    Line1
    Line2
    Line3
  </summary>
</Document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass',
        declFile: 'F',
        declId: 'I',
        summary: {
            paragraphs: [{
                kind: 'Paragraph',
                content: [{ kind: 'Text', text: 'Line1' }]
            }, {
                kind: 'Paragraph',
                content: [{ kind: 'Text', text: 'Line2' }]
            }, {
                kind: 'Paragraph',
                content: [{ kind: 'Text', text: 'Line3' }]
            }]
        }
    };
    assert.deepStrictEqual(parseDocArticle(input, exampleRetriver), output);
});

test(`<summary> with links`, () => {
    const input = `
<Document symbolId="::MyClass" accessor="" category="Class" name="MyClass" declFile="F" declId="I">
  <summary>
    Line1
    Line2 <symbol name="a" declFile="F" declId="I"/> Line2
    Line3 <symbols>
        <symbol name="b" declFile="F" declId="I"/>
        <symbol name="c" declFile="F" declId="I"/>
    </symbols> Line3
    Line4
  </summary>
</Document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass',
        declFile: 'F',
        declId: 'I',
        summary: {
            paragraphs: [{
                kind: 'Paragraph',
                content: [{ kind: 'Text', text: 'Line1' }]
            }, {
                kind: 'Paragraph',
                content: [{ kind: 'Text', text: 'Line2 ' }, { kind: 'Plugin', plugin: { kind: 'Symbols', symbols: [{ name: 'a', declFile: 'F', declId: 'I' }] } }, { kind: 'Text', text: ' Line2' }]
            }, {
                kind: 'Paragraph',
                content: [{ kind: 'Text', text: 'Line3 ' }, { kind: 'Plugin', plugin: { kind: 'Symbols', symbols: [{ name: 'b', declFile: 'F', declId: 'I' }, { name: 'c', declFile: 'F', declId: 'I' }] } }, { kind: 'Text', text: ' Line3' }]
            }, {
                kind: 'Paragraph',
                content: [{ kind: 'Text', text: 'Line4' }]
            }]
        }
    };
    assert.deepStrictEqual(parseDocArticle(input, exampleRetriver), output);
});

test(`<summary> with links surrounded by CRLF`, () => {
    const input = `
<Document symbolId="::MyClass" accessor="" category="Class" name="MyClass" declFile="F" declId="I">
  <summary>
    Line1
    <symbol name="a" declFile="F" declId="I"/> Line2
    Line3
    Line4 <symbol name="b" declFile="F" declId="I"/>
    Line5
  </summary>
</Document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass',
        declFile: 'F',
        declId: 'I',
        summary: {
            paragraphs: [{
                kind: 'Paragraph',
                content: [{ kind: 'Text', text: 'Line1' }]
            }, {
                kind: 'Paragraph',
                content: [{ kind: 'Plugin', plugin: { kind: 'Symbols', symbols: [{ name: 'a', declFile: 'F', declId: 'I' }] } }, { kind: 'Text', text: ' Line2' }]
            }, {
                kind: 'Paragraph',
                content: [{ kind: 'Text', text: 'Line3' }]
            }, {
                kind: 'Paragraph',
                content: [{ kind: 'Text', text: 'Line4 ' }, { kind: 'Plugin', plugin: { kind: 'Symbols', symbols: [{ name: 'b', declFile: 'F', declId: 'I' }] } }]
            }, {
                kind: 'Paragraph',
                content: [{ kind: 'Text', text: 'Line5' }]
            }]
        }
    };
    assert.deepStrictEqual(parseDocArticle(input, exampleRetriver), output);
});

test(`<summary> with article paragraphs`, () => {
    const input = `
<Document symbolId="::MyClass" accessor="" category="Class" name="MyClass" declFile="F" declId="I">
  <summary>
    <p>Line1</p>
    <p>Line2 <symbol name="a" declFile="F" declId="I"/> Line2</p>
    <p><b>Line3 </b><symbols>
        <symbol name="b" declFile="F" declId="I"/>
        <symbol name="c" declFile="F" declId="I"/>
    </symbols> Line3</p>
    <p>Line4</p>
  </summary>
</Document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass',
        declFile: 'F',
        declId: 'I',
        summary: {
            paragraphs: [{
                kind: 'Paragraph',
                content: [{ kind: 'Text', text: 'Line1' }]
            }, {
                kind: 'Paragraph',
                content: [{ kind: 'Text', text: 'Line2 ' }, { kind: 'Plugin', plugin: { kind: 'Symbols', symbols: [{ name: 'a', declFile: 'F', declId: 'I' }] } }, { kind: 'Text', text: ' Line2' }]
            }, {
                kind: 'Paragraph',
                content: [{ kind: 'Strong', content: [{ kind: 'Text', text: 'Line3 ' }] }, { kind: 'Plugin', plugin: { kind: 'Symbols', symbols: [{ name: 'b', declFile: 'F', declId: 'I' }, { name: 'c', declFile: 'F', declId: 'I' }] } }, { kind: 'Text', text: ' Line3' }]
            }, {
                kind: 'Paragraph',
                content: [{ kind: 'Text', text: 'Line4' }]
            }]
        }
    };
    assert.deepStrictEqual(parseDocArticle(input, exampleRetriver), output);
});

test(`<summary> with implicit article paragraphs`, () => {
    const input = `
<Document symbolId="::MyClass" accessor="" category="Class" name="MyClass" declFile="F" declId="I">
  <summary>This is a <b>book</b>.</summary>
</Document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass',
        declFile: 'F',
        declId: 'I',
        summary: {
            paragraphs: [{
                kind: 'Paragraph',
                content: [{ kind: 'Text', text: 'This is a ' }, { kind: 'Strong', content: [{ kind: 'Text', text: 'book' }] }, { kind: 'Text', text: '.' }]
            }]
        }
    };
    assert.deepStrictEqual(parseDocArticle(input, exampleRetriver), output);
});

test(`DocText with text in document`, () => {
    const input = `
<Document symbolId="::MyClass" accessor="" category="Class" name="MyClass" declFile="F" declId="I">
  <summary>summary</summary>
  <remarks>remarks</remarks>
  <returns>returns</returns>
  <enumitem name="a">a</enumitem>
  <enumitem name="b">b</enumitem>
  <typeparam name="a">a</typeparam>
  <typeparam name="b">b</typeparam>
  <param name="a">a</param>
  <param name="b">b</param>
</Document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass',
        declFile: 'F',
        declId: 'I',
        summary: { paragraphs: [{ kind: 'Paragraph', content: [{ kind: 'Text', text: 'summary' }] }] },
        remarks: { paragraphs: [{ kind: 'Paragraph', content: [{ kind: 'Text', text: 'remarks' }] }] },
        returns: { paragraphs: [{ kind: 'Paragraph', content: [{ kind: 'Text', text: 'returns' }] }] },
        enumitem: [
            { name: 'a', paragraphs: [{ kind: 'Paragraph', content: [{ kind: 'Text', text: 'a' }] }] },
            { name: 'b', paragraphs: [{ kind: 'Paragraph', content: [{ kind: 'Text', text: 'b' }] }] }
        ],
        typeparam: [
            { name: 'a', paragraphs: [{ kind: 'Paragraph', content: [{ kind: 'Text', text: 'a' }] }] },
            { name: 'b', paragraphs: [{ kind: 'Paragraph', content: [{ kind: 'Text', text: 'b' }] }] }
        ],
        param: [
            { name: 'a', paragraphs: [{ kind: 'Paragraph', content: [{ kind: 'Text', text: 'a' }] }] },
            { name: 'b', paragraphs: [{ kind: 'Paragraph', content: [{ kind: 'Text', text: 'b' }] }] }
        ]
    };
    assert.deepStrictEqual(parseDocArticle(input, exampleRetriver), output);
});
