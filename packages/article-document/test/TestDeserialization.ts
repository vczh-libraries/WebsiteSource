import * as assert from 'assert';
import { DocArticle, parseDocArticle } from '../src';

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
    assert.deepStrictEqual(parseDocArticle(input), output);
});

test(`<signature> and <example>`, () => {
    const input = `
<Document symbolId="::MyClass" accessor="" category="Class" name="MyClass" declFile="F" declId="I">
  <signature><![CDATA[this is a signature]]></signature>
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
        signature: 'this is a signature',
        example: 'this is an example'
    };
    assert.deepStrictEqual(parseDocArticle(input), output);
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
    assert.deepStrictEqual(parseDocArticle(input), output);
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
                content: [{ kind: 'Text', text: 'Line1' }]
            }, {
                content: [{ kind: 'Text', text: 'Line2' }]
            }, {
                content: [{ kind: 'Text', text: 'Line3' }]
            }]
        }
    };
    assert.deepStrictEqual(parseDocArticle(input), output);
});

test(`<summary> with links`, () => {
    const input = `
<Document symbolId="::MyClass" accessor="" category="Class" name="MyClass" declFile="F" declId="I">
  <summary>
    Line1
    Line2<symbol name="a" declFile="F" declId="I"/>Line2
    Line3<symbols>
        <symbol name="b" declFile="F" declId="I"/>
        <symbol name="c" declFile="F" declId="I"/>
    </symbols>Line3
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
                content: [{ kind: 'Text', text: 'Line1' }]
            }, {
                content: [{ kind: 'Text', text: 'Line2' }, { kind: 'Symbols', symbols: [{ name: 'a', declFile: 'F', declId: 'I' }] }, { kind: 'Text', text: 'Line2' }]
            }, {
                content: [{ kind: 'Text', text: 'Line3' }, { kind: 'Symbols', symbols: [{ name: 'b', declFile: 'F', declId: 'I' }, { name: 'c', declFile: 'F', declId: 'I' }] }, { kind: 'Text', text: 'Line3' }]
            }, {
                content: [{ kind: 'Text', text: 'Line4' }]
            }]
        }
    };
    assert.deepStrictEqual(parseDocArticle(input), output);
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
        summary: { paragraphs: [{ content: [{ kind: 'Text', text: 'summary' }] }] },
        remarks: { paragraphs: [{ content: [{ kind: 'Text', text: 'remarks' }] }] },
        returns: { paragraphs: [{ content: [{ kind: 'Text', text: 'returns' }] }] },
        enumitem: [
            { name: 'a', paragraphs: [{ content: [{ kind: 'Text', text: 'a' }] }] },
            { name: 'b', paragraphs: [{ content: [{ kind: 'Text', text: 'b' }] }] }
        ],
        typeparam: [
            { name: 'a', paragraphs: [{ content: [{ kind: 'Text', text: 'a' }] }] },
            { name: 'b', paragraphs: [{ content: [{ kind: 'Text', text: 'b' }] }] }
        ],
        param: [
            { name: 'a', paragraphs: [{ content: [{ kind: 'Text', text: 'a' }] }] },
            { name: 'b', paragraphs: [{ content: [{ kind: 'Text', text: 'b' }] }] }
        ]
    };
    assert.deepStrictEqual(parseDocArticle(input), output);
});
