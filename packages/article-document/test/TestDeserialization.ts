import * as assert from 'assert';
import { DocArticle, parseDocArticle } from '../src';

test(`Empty Document`, () => {
    const input = `
<document symbolId="::MyClass" accessor="" category="Class" name="MyClass">
</document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass'
    };
    assert.deepStrictEqual(parseDocArticle(input), output);
});

test(`<signature> and <example>`, () => {
    const input = `
<document symbolId="::MyClass" accessor="" category="Class" name="MyClass">
  <signature><![CDATA[this is a signature]]></signature>
  <example><![CDATA[this is an example]]></example>
</document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass',
        signature: 'this is a signature',
        example: 'this is an example'
    };
    assert.deepStrictEqual(parseDocArticle(input), output);
});

test(`<basetypes> and <seealsos>`, () => {
    const input = `
<document symbolId="::MyClass" accessor="" category="Class" name="MyClass">
  <basetypes>
    <symbol docId="A" declFile="B" declId="C"/>
    <symbol docId="D" declFile="E" declId="F"/>
  </basetypes>
  <seealsos>
    <symbol declFile="B" declId="C"/>
    <symbol declFile="E" declId="F"/>
  </seealsos>
</document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass',
        basetypes: [
            { kind: 'Symbol', docId: 'A', declFile: 'B', declId: 'C' },
            { kind: 'Symbol', docId: 'D', declFile: 'E', declId: 'F' }
        ],
        seealsos: [
            { kind: 'Symbol', declFile: 'B', declId: 'C' },
            { kind: 'Symbol', declFile: 'E', declId: 'F' }
        ]
    };
    assert.deepStrictEqual(parseDocArticle(input), output);
});

test(`<summary> with text`, () => {
    const input = `
<document symbolId="::MyClass" accessor="" category="Class" name="MyClass">
  <summary>
    Line1
    Line2
    Line3
  </summary>
</document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass',
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

test(`DocText with text in document`, () => {
    const input = `
<document symbolId="::MyClass" accessor="" category="Class" name="MyClass">
  <summary>summary</summary>
  <remarks>remarks</remarks>
  <returns>returns</returns>
  <enumitem name="a">a</enumitem>
  <enumitem name="b">b</enumitem>
  <typeparam name="a">a</typeparam>
  <typeparam name="b">b</typeparam>
  <param name="a">a</param>
  <param name="b">b</param>
</document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass',
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
